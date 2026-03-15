-- =========================
-- NEW USER PROFILE
-- =========================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, onboarding_completed)
  values (new.id, new.email, false);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- =========================
-- DEFAULT ENTITLEMENTS FOR NEW USER
-- =========================
create or replace function public.apply_default_profile_entitlements()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.is_vip := false;
  new.can_create_feed_posts := false;
  new.daily_feed_post_limit := 0;
  new.can_upload_feed_images := false;
  new.outgoing_intro_limit_mode := 'one_per_day';
  new.outgoing_intro_daily_limit := 0;
  new.can_see_who_likes_me := false;
  return new;
end;
$$;

drop trigger if exists trg_apply_default_profile_entitlements on public.profiles;
create trigger trg_apply_default_profile_entitlements
before insert on public.profiles
for each row
execute function public.apply_default_profile_entitlements();

-- =========================
-- ADMIN HELPERS
-- =========================
create or replace function public.is_current_user_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

-- =========================
-- BLOCK HELPERS
-- =========================
create or replace function public.are_users_blocked(p_user_a uuid, p_user_b uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_blocks b
    where
      (b.blocker_id = p_user_a and b.blocked_user_id = p_user_b)
      or
      (b.blocker_id = p_user_b and b.blocked_user_id = p_user_a)
  );
$$;

create or replace function public.block_user(p_target_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid := auth.uid();
begin
  if v_me is null then
    raise exception 'Unauthorized';
  end if;

  if p_target_user_id is null or p_target_user_id = v_me then
    raise exception 'Invalid target user';
  end if;

  insert into public.user_blocks (blocker_id, blocked_user_id)
  values (v_me, p_target_user_id)
  on conflict (blocker_id, blocked_user_id) do nothing;

  delete from public.intro_requests r
  where
    (r.initiator_id = v_me and r.recipient_id = p_target_user_id)
    or
    (r.initiator_id = p_target_user_id and r.recipient_id = v_me);

  return true;
end;
$$;

create or replace function public.report_user(
  p_target_user_id uuid,
  p_reason text,
  p_details text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid := auth.uid();
begin
  if v_me is null then
    raise exception 'Unauthorized';
  end if;

  if p_target_user_id is null or p_target_user_id = v_me then
    raise exception 'Invalid target user';
  end if;

  if coalesce(length(trim(p_reason)), 0) = 0 then
    raise exception 'Reason is required';
  end if;

  insert into public.user_reports (
    reporter_id,
    reported_user_id,
    reason,
    details
  )
  values (
    v_me,
    p_target_user_id,
    trim(p_reason),
    nullif(trim(coalesce(p_details, '')), '')
  );

  return true;
end;
$$;

-- =========================
-- DISCOVER
-- =========================
drop function if exists public.get_discover_profiles(uuid);

create function public.get_discover_profiles(p_user_id uuid)
returns table (
  id uuid,
  full_name text,
  birth_date date,
  bio text,
  city text,
  country text,
  avatar_url text,
  is_vip boolean,
  photos jsonb
)
language sql
security definer
set search_path = public
as $$
with me as (
  select *
  from public.profiles
  where id = p_user_id
),
candidates as (
  select p.*
  from public.profiles p, me
  where p.id <> me.id
    and not public.are_users_blocked(me.id, p.id)
    and p.onboarding_completed = true
    and (
      (coalesce(me.search_mode, 'country') = 'country'
        and p.country_code = coalesce(me.search_country_code, me.country_code))
      or
      (
        coalesce(me.search_mode, 'country') = 'city'
        and p.country_code = coalesce(me.search_country_code, me.country_code)
        and (
          me.search_city is null
          or trim(me.search_city) = ''
          or p.city = me.search_city
        )
      )
    )
    and (
      p.gender = any(me.looking_for)
      or 'both' = any(me.looking_for)
    )
    and extract(year from age(current_date, p.birth_date))::int
      between coalesce(me.preferred_age_min, 18) and coalesce(me.preferred_age_max, 60)
    and not exists (
      select 1
      from public.swipes s
      where s.swiper_id = me.id
        and s.target_user_id = p.id
    )
)
select
  c.id,
  c.full_name,
  c.birth_date,
  c.bio,
  c.city,
  c.country,
  c.avatar_url,
  c.is_vip,
  coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'id', pp.id,
          'image_url', pp.image_url,
          'sort_order', pp.sort_order
        )
        order by pp.sort_order asc
      )
      from public.profile_photos pp
      where pp.user_id = c.id
    ),
    '[]'::jsonb
  ) as photos
from candidates c
limit 50;
$$;

-- =========================
-- SWIPE / MATCH
-- =========================
drop function if exists public.handle_swipe(uuid, text);

create function public.handle_swipe(
  p_target_user_id uuid,
  p_action text
)
returns table (
  matched boolean,
  out_match_id uuid,
  out_conversation_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid := auth.uid();
  v_existing_match_id uuid;
  v_existing_conversation_id uuid;
  v_user_a uuid;
  v_user_b uuid;
begin
  if v_me is null then
    raise exception 'Unauthorized';
  end if;

  if p_action not in ('like', 'pass') then
    raise exception 'Invalid action';
  end if;

  insert into public.swipes (swiper_id, target_user_id, action)
  values (v_me, p_target_user_id, p_action)
  on conflict (swiper_id, target_user_id)
  do update set action = excluded.action;

  if p_action = 'like' and exists (
    select 1
    from public.swipes s
    where s.swiper_id = p_target_user_id
      and s.target_user_id = v_me
      and s.action = 'like'
  ) then
    v_user_a := least(v_me, p_target_user_id);
    v_user_b := greatest(v_me, p_target_user_id);

    insert into public.matches (user_a, user_b)
    values (v_user_a, v_user_b)
    on conflict (user_a, user_b) do nothing;

    select m.id
    into v_existing_match_id
    from public.matches m
    where m.user_a = v_user_a
      and m.user_b = v_user_b
    limit 1;

    insert into public.conversations (match_id)
    values (v_existing_match_id)
    on conflict (match_id) do nothing;

    select c.id
    into v_existing_conversation_id
    from public.conversations c
    where c.match_id = v_existing_match_id
    limit 1;

    insert into public.conversation_members (conversation_id, user_id)
    values
      (v_existing_conversation_id, v_user_a),
      (v_existing_conversation_id, v_user_b)
    on conflict do nothing;

    return query
    select true, v_existing_match_id, v_existing_conversation_id;
  else
    return query
    select false, null::uuid, null::uuid;
  end if;
end;
$$;

-- =========================
-- MATCH / LIKES / MESSAGES
-- =========================
create or replace function public.get_my_matches()
returns table (
  match_id uuid,
  conversation_id uuid,
  other_user_id uuid,
  other_user_full_name text,
  other_user_birth_date date,
  other_user_city text,
  other_user_country text,
  other_user_avatar_url text,
  matched_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  with my_matches as (
    select m.id as match_id, m.user_a, m.user_b, m.created_at
    from public.matches m
    where m.user_a = auth.uid() or m.user_b = auth.uid()
  ),
  other_users as (
    select
      mm.match_id,
      case when mm.user_a = auth.uid() then mm.user_b else mm.user_a end as other_user_id,
      mm.created_at
    from my_matches mm
  )
  select
    ou.match_id,
    c.id as conversation_id,
    p.id as other_user_id,
    p.full_name as other_user_full_name,
    p.birth_date as other_user_birth_date,
    p.city as other_user_city,
    p.country as other_user_country,
    p.avatar_url as other_user_avatar_url,
    ou.created_at as matched_at
  from other_users ou
  join public.profiles p
    on p.id = ou.other_user_id
  left join public.conversations c
    on c.match_id = ou.match_id
  where not public.are_users_blocked(auth.uid(), p.id)
  order by ou.created_at desc;
$$;

create or replace function public.get_likes_me_count()
returns bigint
language sql
security definer
set search_path = public
as $$
  select coalesce(count(distinct s.swiper_id), 0)::bigint
  from public.swipes s
  where s.target_user_id = auth.uid()
    and s.action = 'like'
    and s.swiper_id <> auth.uid();
$$;

create or replace function public.can_current_user_see_who_liked()
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce(p.can_see_who_likes_me, false)
  from public.profiles p
  where p.id = auth.uid();
$$;

drop function if exists public.get_people_who_liked_me();

create or replace function public.get_people_who_liked_me()
returns table (
  id uuid,
  full_name text,
  birth_date date,
  bio text,
  city text,
  country text,
  avatar_url text,
  liked_at timestamptz,
  photos jsonb
)
language sql
security definer
set search_path = public
as $$
  with incoming_likes as (
    select s.swiper_id, max(s.created_at) as liked_at
    from public.swipes s
    where s.target_user_id = auth.uid()
      and s.action = 'like'
      and s.swiper_id <> auth.uid()
    group by s.swiper_id
  )
  select
    p.id,
    p.full_name,
    p.birth_date,
    p.bio,
    p.city,
    p.country,
    p.avatar_url,
    il.liked_at,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', pp.id,
            'image_url', pp.image_url,
            'sort_order', pp.sort_order
          )
          order by pp.sort_order asc
        )
        from public.profile_photos pp
        where pp.user_id = p.id
      ),
      '[]'::jsonb
    ) as photos
  from incoming_likes il
  join public.profiles p
    on p.id = il.swiper_id
  where not public.are_users_blocked(auth.uid(), p.id)
    and not exists (
      select 1
      from public.swipes s2
      where s2.swiper_id = auth.uid()
        and s2.target_user_id = p.id
    )
    and not exists (
      select 1
      from public.matches m
      where m.user_a = least(auth.uid(), p.id)
        and m.user_b = greatest(auth.uid(), p.id)
    )
  order by il.liked_at desc;
$$;

create or replace function public.get_unread_conversation_counts()
returns table (
  conversation_id uuid,
  unread_count bigint
)
language sql
security definer
set search_path = public
as $$
  select
    m.conversation_id,
    count(*)::bigint as unread_count
  from public.messages m
  where m.is_seen = false
    and m.sender_id <> auth.uid()
    and exists (
      select 1
      from public.conversation_members cm
      where cm.conversation_id = m.conversation_id
        and cm.user_id = auth.uid()
    )
  group by m.conversation_id;
$$;

create or replace function public.get_total_unread_messages()
returns bigint
language sql
security definer
set search_path = public
as $$
  select coalesce(count(*), 0)::bigint
  from public.messages m
  where m.is_seen = false
    and m.sender_id <> auth.uid()
    and exists (
      select 1
      from public.conversation_members cm
      where cm.conversation_id = m.conversation_id
        and cm.user_id = auth.uid()
    );
$$;

-- =========================
-- INTRO REQUESTS
-- =========================
drop function if exists public.send_intro_request(uuid, text);

create function public.send_intro_request(
  p_target_user_id uuid,
  p_content text
)
returns table (
  request_id uuid,
  sender_remaining_today integer,
  recipient_remaining_today integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid := auth.uid();
  v_sender_limit_mode text;
  v_sender_daily_limit integer;
  v_sender_effective_limit integer;
  v_sender_sent_today integer;
  v_recipient_allow_intro boolean;
  v_recipient_limit_mode text;
  v_recipient_daily_limit integer;
  v_recipient_effective_limit integer;
  v_recipient_received_today integer;
  v_request_id uuid;
  v_user_a uuid;
  v_user_b uuid;
begin
  if v_me is null then
    raise exception 'Unauthorized';
  end if;

  if p_target_user_id is null or p_target_user_id = v_me then
    raise exception 'Invalid target user';
  end if;

  if coalesce(length(trim(p_content)), 0) = 0 then
    raise exception 'Message is required';
  end if;

  if length(trim(p_content)) > 500 then
    raise exception 'Message is too long';
  end if;

  v_user_a := least(v_me, p_target_user_id);
  v_user_b := greatest(v_me, p_target_user_id);

  if exists (
    select 1
    from public.matches m
    where m.user_a = v_user_a and m.user_b = v_user_b
  ) then
    raise exception 'You are already matched';
  end if;

  select p.outgoing_intro_limit_mode, p.outgoing_intro_daily_limit
  into v_sender_limit_mode, v_sender_daily_limit
  from public.profiles p
  where p.id = v_me;

  if v_sender_limit_mode = 'many_per_day' then
    v_sender_effective_limit := greatest(coalesce(v_sender_daily_limit, 1), 1);
  else
    v_sender_effective_limit := 1;
  end if;

  select count(*)
  into v_sender_sent_today
  from public.intro_requests r
  where r.initiator_id = v_me
    and r.created_at::date = current_date;

  if v_sender_sent_today >= v_sender_effective_limit then
    raise exception 'Daily sending limit reached';
  end if;

  select
    p.allow_intro_messages,
    p.incoming_intro_limit_mode,
    p.incoming_intro_daily_limit
  into
    v_recipient_allow_intro,
    v_recipient_limit_mode,
    v_recipient_daily_limit
  from public.profiles p
  where p.id = p_target_user_id;

  if coalesce(v_recipient_allow_intro, false) = false then
    raise exception 'This user does not accept intro messages';
  end if;

  if v_recipient_limit_mode = 'many_per_day' then
    v_recipient_effective_limit := greatest(coalesce(v_recipient_daily_limit, 1), 1);
  else
    v_recipient_effective_limit := 1;
  end if;

  select count(*)
  into v_recipient_received_today
  from public.intro_requests r
  where r.recipient_id = p_target_user_id
    and r.created_at::date = current_date;

  if v_recipient_received_today >= v_recipient_effective_limit then
    raise exception 'This user has reached their daily incoming intro limit';
  end if;

  if exists (
    select 1
    from public.intro_requests r
    where (
      (r.initiator_id = v_me and r.recipient_id = p_target_user_id)
      or
      (r.initiator_id = p_target_user_id and r.recipient_id = v_me)
    )
    and r.status = 'pending'
  ) then
    raise exception 'There is already a pending intro request between these users';
  end if;

  insert into public.intro_requests (
    initiator_id,
    recipient_id,
    content,
    status
  )
  values (
    v_me,
    p_target_user_id,
    trim(p_content),
    'pending'
  )
  returning id into v_request_id;

  return query
  select
    v_request_id,
    greatest(v_sender_effective_limit - v_sender_sent_today - 1, 0),
    greatest(v_recipient_effective_limit - v_recipient_received_today - 1, 0);
end;
$$;

create or replace function public.respond_intro_request(
  p_request_id uuid,
  p_decision text
)
returns table (
  accepted boolean,
  conversation_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid := auth.uid();
  v_request public.intro_requests%rowtype;
  v_conversation_id uuid;
begin
  if v_me is null then
    raise exception 'Unauthorized';
  end if;

  if p_decision not in ('accepted', 'rejected') then
    raise exception 'Invalid decision';
  end if;

  select *
  into v_request
  from public.intro_requests r
  where r.id = p_request_id
    and r.recipient_id = v_me
    and r.status = 'pending';

  if not found then
    raise exception 'Request not found or already handled';
  end if;

  if p_decision = 'accepted' then
    select cm1.conversation_id
    into v_conversation_id
    from public.conversation_members cm1
    join public.conversation_members cm2
      on cm1.conversation_id = cm2.conversation_id
    where cm1.user_id = v_request.initiator_id
      and cm2.user_id = v_request.recipient_id
    limit 1;

    if v_conversation_id is null then
      insert into public.conversations default values
      returning id into v_conversation_id;

      insert into public.conversation_members (conversation_id, user_id)
      values
        (v_conversation_id, v_request.initiator_id),
        (v_conversation_id, v_request.recipient_id)
      on conflict do nothing;
    end if;

    insert into public.messages (
      conversation_id,
      sender_id,
      content
    )
    values (
      v_conversation_id,
      v_request.initiator_id,
      v_request.content
    );

    update public.intro_requests
    set
      status = 'accepted',
      conversation_id = v_conversation_id,
      responded_at = now()
    where id = v_request.id;

    return query
    select true, v_conversation_id;
  else
    update public.intro_requests
    set
      status = 'rejected',
      content = '',
      responded_at = now()
    where id = v_request.id;

    return query
    select false, null::uuid;
  end if;
end;
$$;

drop function if exists public.get_pending_intro_requests();

create function public.get_pending_intro_requests()
returns table(
  request_id uuid,
  initiator_id uuid,
  initiator_full_name text,
  initiator_avatar_url text,
  initiator_is_vip boolean,
  content text,
  created_at timestamptz
)
language sql
security definer
set search_path to public
as $$
  select
    r.id as request_id,
    p.id as initiator_id,
    p.full_name as initiator_full_name,
    p.avatar_url as initiator_avatar_url,
    p.is_vip as initiator_is_vip,
    r.content,
    r.created_at
  from public.intro_requests r
  join public.profiles p
    on p.id = r.initiator_id
  where r.recipient_id = auth.uid()
    and r.status = 'pending'
  order by r.created_at desc;
$$;

-- =========================
-- INBOX / CHAT
-- =========================
drop function if exists public.get_conversation_other_user(uuid);
drop function if exists public.get_inbox_conversations();

create function public.get_conversation_other_user(p_conversation_id uuid)
returns table(
  other_user_id uuid,
  other_user_full_name text,
  other_user_avatar_url text,
  other_user_is_vip boolean
)
language sql
security definer
set search_path to public
as $$
  select
    p.id as other_user_id,
    p.full_name as other_user_full_name,
    p.avatar_url as other_user_avatar_url,
    p.is_vip as other_user_is_vip
  from public.conversation_members cm
  join public.profiles p
    on p.id = cm.user_id
  where cm.conversation_id = p_conversation_id
    and cm.user_id <> auth.uid()
    and not public.are_users_blocked(auth.uid(), p.id)
  limit 1;
$$;

create function public.get_inbox_conversations()
returns table(
  conversation_id uuid,
  other_user_id uuid,
  other_user_full_name text,
  other_user_avatar_url text,
  other_user_is_vip boolean,
  last_message text,
  last_message_at timestamptz
)
language sql
security definer
set search_path to public
as $$
  with my_conversations as (
    select cm.conversation_id
    from public.conversation_members cm
    where cm.user_id = auth.uid()
  ),
  other_members as (
    select
      cm.conversation_id,
      cm.user_id as other_user_id
    from public.conversation_members cm
    join my_conversations mc
      on mc.conversation_id = cm.conversation_id
    where cm.user_id <> auth.uid()
  ),
  last_messages as (
    select distinct on (m.conversation_id)
      m.conversation_id,
      m.content,
      m.created_at
    from public.messages m
    join my_conversations mc
      on mc.conversation_id = m.conversation_id
    order by m.conversation_id, m.created_at desc
  )
  select
    om.conversation_id,
    p.id as other_user_id,
    p.full_name as other_user_full_name,
    p.avatar_url as other_user_avatar_url,
    p.is_vip as other_user_is_vip,
    lm.content as last_message,
    lm.created_at as last_message_at
  from other_members om
  join public.profiles p
    on p.id = om.other_user_id
  left join last_messages lm
    on lm.conversation_id = om.conversation_id
  where not public.are_users_blocked(auth.uid(), p.id)
  order by lm.created_at desc nulls last;
$$;

-- =========================
-- ADMIN SUPPORT CHAT
-- =========================
create or replace function public.ensure_admin_support_conversation(
  p_user_id uuid,
  p_admin_user_id uuid
)
returns uuid
language plpgsql
security definer
set search_path to public
as $$
declare
  v_conversation_id uuid;
begin
  if p_user_id is null or p_admin_user_id is null then
    raise exception 'Missing user id or admin id';
  end if;

  if p_user_id = p_admin_user_id then
    raise exception 'User and admin cannot be the same';
  end if;

  select cm1.conversation_id
  into v_conversation_id
  from public.conversation_members cm1
  join public.conversation_members cm2
    on cm1.conversation_id = cm2.conversation_id
  where cm1.user_id = p_user_id
    and cm2.user_id = p_admin_user_id
  limit 1;

  if v_conversation_id is not null then
    return v_conversation_id;
  end if;

  insert into public.conversations default values
  returning id into v_conversation_id;

  insert into public.conversation_members (conversation_id, user_id)
  values
    (v_conversation_id, p_user_id),
    (v_conversation_id, p_admin_user_id);

  insert into public.messages (
    conversation_id,
    sender_id,
    content,
    is_seen
  )
  values (
    v_conversation_id,
    p_admin_user_id,
    'Xin chào, mình là bộ phận hỗ trợ. Nếu bạn cần trợ giúp, cứ nhắn tin tại đây nhé.',
    false
  );

  return v_conversation_id;
end;
$$;

-- =========================
-- ADMIN REPORTS
-- =========================
create or replace function public.get_admin_reports()
returns table (
  report_id uuid,
  reporter_id uuid,
  reporter_name text,
  reporter_email text,
  reported_user_id uuid,
  reported_user_name text,
  reported_user_email text,
  reason text,
  details text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    r.id as report_id,
    reporter.id as reporter_id,
    reporter.full_name as reporter_name,
    reporter.email as reporter_email,
    reported.id as reported_user_id,
    reported.full_name as reported_user_name,
    reported.email as reported_user_email,
    r.reason,
    r.details,
    r.created_at
  from public.user_reports r
  join public.profiles reporter
    on reporter.id = r.reporter_id
  join public.profiles reported
    on reported.id = r.reported_user_id
  where public.is_current_user_admin()
  order by r.created_at desc;
$$;

-- =========================
-- VIP REQUESTS
-- =========================
create or replace function public.admin_handle_vip_request(
  p_request_id uuid,
  p_status text,
  p_admin_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.vip_requests%rowtype;
begin
  if not public.is_current_user_admin() then
    raise exception 'Unauthorized';
  end if;

  if p_status not in ('approved', 'rejected') then
    raise exception 'Invalid status';
  end if;

  select *
  into v_request
  from public.vip_requests
  where id = p_request_id;

  if not found then
    raise exception 'VIP request not found';
  end if;

  update public.vip_requests
  set status = p_status,
      admin_note = p_admin_note,
      updated_at = now(),
      reviewed_at = now(),
      reviewed_by = auth.uid()
  where id = p_request_id;

  if p_status = 'approved' then
    update public.profiles
    set is_vip = true,
        is_verified_member = true,
        can_create_feed_posts = true,
        daily_feed_post_limit = greatest(coalesce(daily_feed_post_limit, 0), 1),
        updated_at = now()
    where id = v_request.user_id;
  end if;
end;
$$;

create or replace function public.approve_vip_request_admin(p_request_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_id uuid;
  v_target_user_id uuid;
begin
  v_admin_id := auth.uid();

  if v_admin_id is null then
    raise exception 'Unauthorized';
  end if;

  if not exists (
    select 1 from public.profiles where id = v_admin_id and is_admin = true
  ) then
    raise exception 'Bạn không có quyền thực hiện thao tác này';
  end if;

  select user_id
  into v_target_user_id
  from public.vip_requests
  where id = p_request_id
    and status = 'pending'
  limit 1;

  if v_target_user_id is null then
    raise exception 'Không tìm thấy yêu cầu VIP đang chờ duyệt';
  end if;

  update public.vip_requests
  set
    status = 'approved',
    reviewed_by = v_admin_id,
    reviewed_at = now(),
    updated_at = now()
  where id = p_request_id;

  update public.profiles
  set
    is_vip = true,
    is_verified_member = true,
    can_create_feed_posts = true,
    daily_feed_post_limit = greatest(coalesce(daily_feed_post_limit, 0), 1),
    updated_at = now()
  where id = v_target_user_id;

  return v_target_user_id;
end;
$$;

create or replace function public.reject_vip_request_admin(p_request_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_id uuid;
  v_target_user_id uuid;
begin
  v_admin_id := auth.uid();

  if v_admin_id is null then
    raise exception 'Unauthorized';
  end if;

  if not exists (
    select 1 from public.profiles where id = v_admin_id and is_admin = true
  ) then
    raise exception 'Bạn không có quyền thực hiện thao tác này';
  end if;

  select user_id
  into v_target_user_id
  from public.vip_requests
  where id = p_request_id
    and status = 'pending'
  limit 1;

  if v_target_user_id is null then
    raise exception 'Không tìm thấy yêu cầu VIP đang chờ duyệt';
  end if;

  update public.vip_requests
  set
    status = 'rejected',
    reviewed_by = v_admin_id,
    reviewed_at = now(),
    updated_at = now()
  where id = p_request_id;

  return v_target_user_id;
end;
$$;

create or replace function public.admin_update_user_feed_access(
  p_user_id uuid,
  p_is_vip boolean,
  p_is_verified_member boolean,
  p_can_create_feed_posts boolean,
  p_daily_feed_post_limit integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_current_user_admin() then
    raise exception 'Unauthorized';
  end if;

  update public.profiles
  set is_vip = p_is_vip,
      is_verified_member = p_is_verified_member,
      can_create_feed_posts = p_can_create_feed_posts,
      daily_feed_post_limit = greatest(coalesce(p_daily_feed_post_limit, 0), 0)
  where id = p_user_id;
end;
$$;

-- =========================
-- FEED HELPERS
-- =========================
create or replace function public.can_user_create_feed_post(p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce(p.can_create_feed_posts, false)
  from public.profiles p
  where p.id = p_user_id;
$$;

create or replace function public.get_remaining_feed_posts_today(p_user_id uuid)
returns integer
language sql
security definer
set search_path = public
as $$
  with limits as (
    select coalesce(daily_feed_post_limit, 0) as daily_limit
    from public.profiles
    where id = p_user_id
  ),
  used as (
    select count(*)::int as used_count
    from public.feed_posts
    where user_id = p_user_id
      and created_at::date = current_date
  )
  select greatest((select daily_limit from limits) - (select used_count from used), 0);
$$;

drop function if exists public.create_feed_post(text, text, text);

create function public.create_feed_post(
  p_content text,
  p_image_url text default null,
  p_image_storage_path text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_post_id uuid;
  v_can_create boolean;
  v_remaining integer;
  v_can_upload_feed_images boolean;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  select
    coalesce(p.can_create_feed_posts, false),
    coalesce(p.can_upload_feed_images, false)
  into
    v_can_create,
    v_can_upload_feed_images
  from public.profiles p
  where p.id = v_user_id;

  if not v_can_create then
    raise exception 'Bạn chưa có quyền đăng bài feed';
  end if;

  select public.get_remaining_feed_posts_today(v_user_id)
  into v_remaining;

  if coalesce(v_remaining, 0) <= 0 then
    raise exception 'Bạn đã hết lượt đăng bài hôm nay';
  end if;

  if (p_image_url is not null or p_image_storage_path is not null)
     and not coalesce(v_can_upload_feed_images, false) then
    raise exception 'Bạn chưa có quyền đăng ảnh trong feed';
  end if;

  insert into public.feed_posts (
    user_id,
    content,
    image_url,
    image_storage_path,
    status
  )
  values (
    v_user_id,
    trim(p_content),
    p_image_url,
    p_image_storage_path,
    'approved'
  )
  returning id into v_post_id;

  return v_post_id;
end;
$$;

create or replace function public.toggle_feed_post_like(p_post_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_exists boolean;
  v_like_count integer;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  select exists(
    select 1
    from public.feed_post_likes
    where post_id = p_post_id and user_id = v_user_id
  ) into v_exists;

  if v_exists then
    delete from public.feed_post_likes
    where post_id = p_post_id and user_id = v_user_id;
  else
    insert into public.feed_post_likes (post_id, user_id)
    values (p_post_id, v_user_id);
  end if;

  select count(*)::int into v_like_count
  from public.feed_post_likes
  where post_id = p_post_id;

  update public.feed_posts
  set like_count = v_like_count,
      updated_at = now()
  where id = p_post_id;

  return not v_exists;
end;
$$;

drop function if exists public.create_feed_comment(uuid, text);

create function public.create_feed_comment(
  p_post_id uuid,
  p_content text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_comment_id uuid;
  v_comment_count integer;
  v_is_vip boolean;
  v_today_comment_count integer;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  if trim(coalesce(p_content, '')) = '' then
    raise exception 'Vui lòng nhập nội dung bình luận';
  end if;

  select coalesce(is_vip, false)
  into v_is_vip
  from public.profiles
  where id = v_user_id;

  if not v_is_vip then
    select count(*)::int
    into v_today_comment_count
    from public.feed_post_comments
    where user_id = v_user_id
      and created_at::date = current_date;

    if v_today_comment_count >= 1 then
      raise exception 'Bạn chỉ được bình luận 1 lần mỗi ngày. Hãy nâng cấp VIP để bình luận không giới hạn.';
    end if;
  end if;

  insert into public.feed_post_comments (post_id, user_id, content)
  values (p_post_id, v_user_id, trim(p_content))
  returning id into v_comment_id;

  select count(*)::int into v_comment_count
  from public.feed_post_comments
  where post_id = p_post_id
    and is_hidden = false;

  update public.feed_posts
  set comment_count = v_comment_count,
      updated_at = now()
  where id = p_post_id;

  return v_comment_id;
end;
$$;

create or replace function public.report_feed_post(p_post_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_report_count integer;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  insert into public.feed_post_reports (post_id, user_id)
  values (p_post_id, v_user_id)
  on conflict (post_id, user_id) do nothing;

  select count(*)::int
  into v_report_count
  from public.feed_post_reports
  where post_id = p_post_id;

  update public.feed_posts
  set report_count = v_report_count,
      status = case when v_report_count >= 5 then 'hidden' else status end,
      updated_at = now()
  where id = p_post_id;
end;
$$;

create or replace function public.admin_set_feed_post_hidden(
  p_post_id uuid,
  p_hidden boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_current_user_admin() then
    raise exception 'Unauthorized';
  end if;

  update public.feed_posts
  set is_hidden_by_admin = p_hidden,
      status = case when p_hidden then 'hidden' else 'approved' end,
      updated_at = now()
  where id = p_post_id;
end;
$$;

create or replace function public.admin_get_feed_posts()
returns table(
  id uuid,
  user_id uuid,
  user_full_name text,
  user_avatar_url text,
  user_is_vip boolean,
  content text,
  image_url text,
  status text,
  report_count integer,
  like_count integer,
  comment_count integer,
  is_hidden_by_admin boolean,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    fp.id,
    fp.user_id,
    p.full_name as user_full_name,
    p.avatar_url as user_avatar_url,
    p.is_vip as user_is_vip,
    fp.content,
    fp.image_url,
    fp.status,
    fp.report_count,
    fp.like_count,
    fp.comment_count,
    fp.is_hidden_by_admin,
    fp.created_at
  from public.feed_posts fp
  join public.profiles p
    on p.id = fp.user_id
  where public.is_current_user_admin()
  order by fp.created_at desc;
$$;

create or replace function public.get_feed_posts()
returns table(
  id uuid,
  user_id uuid,
  user_full_name text,
  user_avatar_url text,
  user_is_vip boolean,
  content text,
  image_url text,
  status text,
  report_count integer,
  like_count integer,
  comment_count integer,
  is_hidden_by_admin boolean,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    fp.id,
    fp.user_id,
    p.full_name as user_full_name,
    p.avatar_url as user_avatar_url,
    p.is_vip as user_is_vip,
    fp.content,
    fp.image_url,
    fp.status,
    coalesce(fp.report_count, 0) as report_count,
    coalesce(fp.like_count, 0) as like_count,
    coalesce(fp.comment_count, 0) as comment_count,
    coalesce(fp.is_hidden_by_admin, false) as is_hidden_by_admin,
    fp.created_at
  from public.feed_posts fp
  left join public.profiles p
    on p.id = fp.user_id
  where fp.status = 'approved'
    and coalesce(fp.is_hidden_by_admin, false) = false
  order by fp.created_at desc;
$$;

-- =========================
-- NOTIFICATIONS
-- =========================
create or replace function public.create_feed_like_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_post_owner_id uuid;
  v_actor_name text;
begin
  select fp.user_id
  into v_post_owner_id
  from public.feed_posts fp
  where fp.id = new.post_id
  limit 1;

  if v_post_owner_id is null or v_post_owner_id = new.user_id then
    return new;
  end if;

  select p.full_name
  into v_actor_name
  from public.profiles p
  where p.id = new.user_id
  limit 1;

  insert into public.user_notifications (
    user_id,
    actor_user_id,
    type,
    title,
    body,
    href,
    post_id
  )
  values (
    v_post_owner_id,
    new.user_id,
    'feed_like',
    'Bài viết của bạn có lượt thích mới',
    coalesce(v_actor_name, 'Một người dùng') || ' vừa thích bài viết của bạn.',
    '/feed',
    new.post_id
  );

  return new;
end;
$$;

drop trigger if exists trg_feed_post_likes_notification on public.feed_post_likes;
create trigger trg_feed_post_likes_notification
after insert on public.feed_post_likes
for each row
execute function public.create_feed_like_notification();

create or replace function public.create_feed_comment_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_post_owner_id uuid;
  v_actor_name text;
begin
  select fp.user_id
  into v_post_owner_id
  from public.feed_posts fp
  where fp.id = new.post_id
  limit 1;

  if v_post_owner_id is null or v_post_owner_id = new.user_id then
    return new;
  end if;

  select p.full_name
  into v_actor_name
  from public.profiles p
  where p.id = new.user_id
  limit 1;

  insert into public.user_notifications (
    user_id,
    actor_user_id,
    type,
    title,
    body,
    href,
    post_id,
    comment_id
  )
  values (
    v_post_owner_id,
    new.user_id,
    'feed_comment',
    'Bài viết của bạn có bình luận mới',
    coalesce(v_actor_name, 'Một người dùng') || ' vừa bình luận vào bài viết của bạn.',
    '/feed',
    new.post_id,
    new.id
  );

  return new;
end;
$$;

drop trigger if exists trg_feed_post_comments_notification on public.feed_post_comments;
create trigger trg_feed_post_comments_notification
after insert on public.feed_post_comments
for each row
execute function public.create_feed_comment_notification();

create or replace function public.get_total_unread_notifications_count()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_personal_count integer := 0;
  v_feed_count integer := 0;
  v_last_seen_feed_at timestamptz;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    return 0;
  end if;

  select count(*)
  into v_personal_count
  from public.user_notifications n
  where n.user_id = v_user_id
    and n.is_read = false;

  select p.last_seen_feed_at
  into v_last_seen_feed_at
  from public.profiles p
  where p.id = v_user_id;

  select count(*)
  into v_feed_count
  from public.feed_posts fp
  where fp.status = 'approved'
    and coalesce(fp.is_hidden_by_admin, false) = false
    and fp.user_id <> v_user_id
    and fp.created_at > coalesce(v_last_seen_feed_at, '1970-01-01'::timestamptz);

  return coalesce(v_personal_count, 0) + coalesce(v_feed_count, 0);
end;
$$;

create or replace function public.mark_all_notifications_seen()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    return;
  end if;

  update public.user_notifications
  set is_read = true
  where user_id = v_user_id
    and is_read = false;

  update public.profiles
  set last_seen_feed_at = now()
  where id = v_user_id;
end;
$$;

create or replace function public.get_my_notifications()
returns table(
  id uuid,
  actor_user_id uuid,
  actor_full_name text,
  actor_avatar_url text,
  actor_is_vip boolean,
  type text,
  title text,
  body text,
  href text,
  post_id uuid,
  comment_id uuid,
  is_read boolean,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    n.id,
    n.actor_user_id,
    p.full_name as actor_full_name,
    p.avatar_url as actor_avatar_url,
    p.is_vip as actor_is_vip,
    n.type,
    n.title,
    n.body,
    n.href,
    n.post_id,
    n.comment_id,
    n.is_read,
    n.created_at
  from public.user_notifications n
  left join public.profiles p
    on p.id = n.actor_user_id
  where n.user_id = auth.uid()
  order by n.created_at desc
  limit 100;
$$;

create or replace function public.get_unseen_feed_posts()
returns table(
  id uuid,
  user_id uuid,
  user_full_name text,
  user_avatar_url text,
  user_is_vip boolean,
  content text,
  image_url text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    fp.id,
    fp.user_id,
    p.full_name as user_full_name,
    p.avatar_url as user_avatar_url,
    p.is_vip as user_is_vip,
    fp.content,
    fp.image_url,
    fp.created_at
  from public.feed_posts fp
  left join public.profiles p
    on p.id = fp.user_id
  where fp.status = 'approved'
    and coalesce(fp.is_hidden_by_admin, false) = false
    and fp.user_id <> auth.uid()
    and fp.created_at > coalesce(
      (select last_seen_feed_at from public.profiles where id = auth.uid()),
      '1970-01-01'::timestamptz
    )
  order by fp.created_at desc
  limit 50;
$$;