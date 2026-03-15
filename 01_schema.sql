create extension if not exists pgcrypto;

-- =========================
-- PROFILES
-- =========================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  username text unique,
  full_name text,
  birth_date date,
  gender text,
  looking_for text[],
  bio text,
  city text,
  country text,
  country_code text,
  search_country text,
  search_country_code text,
  search_city text,
  search_mode text default 'country' check (search_mode in ('country', 'city')),
  first_date_idea text,
  weekend_habit text,
  interests text[],
  avatar_url text,
  avatar_storage_path text,
  preferred_age_min integer,
  preferred_age_max integer,
  onboarding_completed boolean not null default false,
  allow_intro_messages boolean not null default true,
  incoming_intro_limit_mode text not null default 'one_per_day'
    check (incoming_intro_limit_mode in ('one_per_day', 'many_per_day')),
  incoming_intro_daily_limit integer not null default 1,
  outgoing_intro_limit_mode text not null default 'one_per_day'
    check (outgoing_intro_limit_mode in ('one_per_day', 'many_per_day')),
  outgoing_intro_daily_limit integer not null default 0,
  is_admin boolean not null default false,
  is_vip boolean not null default false,
  is_verified_member boolean not null default false,
  can_create_feed_posts boolean not null default false,
  daily_feed_post_limit integer not null default 0,
  can_upload_feed_images boolean not null default false,
  can_see_who_likes_me boolean not null default false,
  extra_profile_data jsonb not null default '{}'::jsonb,
  last_seen_feed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================
-- PROFILE PHOTOS
-- =========================
create table if not exists public.profile_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  image_url text not null,
  storage_path text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_profile_photos_user_id
on public.profile_photos(user_id);

-- =========================
-- SWIPES / MATCHES / CONVERSATIONS / MESSAGES
-- =========================
create table if not exists public.swipes (
  id uuid primary key default gen_random_uuid(),
  swiper_id uuid not null references public.profiles(id) on delete cascade,
  target_user_id uuid not null references public.profiles(id) on delete cascade,
  action text not null check (action in ('like', 'pass')),
  created_at timestamptz not null default now(),
  unique (swiper_id, target_user_id)
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_a, user_b)
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  match_id uuid unique references public.matches(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  primary key (conversation_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  is_seen boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_conversation_id
on public.messages(conversation_id);

-- =========================
-- INTRO REQUESTS
-- =========================
create table if not exists public.intro_requests (
  id uuid primary key default gen_random_uuid(),
  initiator_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected')),
  conversation_id uuid references public.conversations(id) on delete set null,
  created_at timestamptz not null default now(),
  responded_at timestamptz
);

create index if not exists idx_intro_requests_initiator_id
on public.intro_requests(initiator_id);

create index if not exists idx_intro_requests_recipient_id
on public.intro_requests(recipient_id);

-- =========================
-- LIKES YOU / REPORTS / BLOCKS
-- =========================
create table if not exists public.user_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_user_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  details text,
  created_at timestamptz not null default now()
);

create table if not exists public.user_blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (blocker_id, blocked_user_id)
);

-- =========================
-- VIP REQUESTS
-- =========================
create table if not exists public.vip_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  phone_number text not null,
  facebook_link text not null,
  face_image_url text not null,
  face_image_storage_path text,
  status text not null default 'pending',
  admin_note text,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_vip_requests_user_id
on public.vip_requests(user_id);

create index if not exists idx_vip_requests_status
on public.vip_requests(status);

-- =========================
-- FEED
-- =========================
create table if not exists public.feed_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  image_url text,
  image_storage_path text,
  status text not null default 'approved',
  report_count integer not null default 0,
  like_count integer not null default 0,
  comment_count integer not null default 0,
  is_hidden_by_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_feed_posts_user_id
on public.feed_posts(user_id);

create index if not exists idx_feed_posts_status
on public.feed_posts(status);

create index if not exists idx_feed_posts_created_at
on public.feed_posts(created_at desc);

create table if not exists public.feed_post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.feed_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create index if not exists idx_feed_post_likes_post_id
on public.feed_post_likes(post_id);

create table if not exists public.feed_post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.feed_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_feed_post_comments_post_id
on public.feed_post_comments(post_id);

create index if not exists idx_feed_post_comments_created_at
on public.feed_post_comments(created_at asc);

create table if not exists public.feed_post_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.feed_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create index if not exists idx_feed_post_reports_post_id
on public.feed_post_reports(post_id);

-- =========================
-- NOTIFICATIONS
-- =========================
create table if not exists public.user_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  actor_user_id uuid references public.profiles(id) on delete set null,
  type text not null check (type in ('feed_like', 'feed_comment')),
  title text not null,
  body text,
  href text,
  post_id uuid references public.feed_posts(id) on delete cascade,
  comment_id uuid references public.feed_post_comments(id) on delete cascade,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_user_notifications_user_id_created_at
on public.user_notifications(user_id, created_at desc);

create index if not exists idx_user_notifications_user_id_is_read
on public.user_notifications(user_id, is_read);

-- =========================
-- REALTIME
-- =========================
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.intro_requests;

-- =========================
-- STORAGE BUCKETS
-- =========================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('vip-verification', 'vip-verification', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('feed-images', 'feed-images', true)
on conflict (id) do nothing;