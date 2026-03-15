-- =========================
-- ENABLE RLS
-- =========================
alter table public.profiles enable row level security;
alter table public.profile_photos enable row level security;
alter table public.swipes enable row level security;
alter table public.matches enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.intro_requests enable row level security;
alter table public.user_reports enable row level security;
alter table public.user_blocks enable row level security;
alter table public.vip_requests enable row level security;
alter table public.feed_posts enable row level security;
alter table public.feed_post_likes enable row level security;
alter table public.feed_post_comments enable row level security;
alter table public.feed_post_reports enable row level security;
alter table public.user_notifications enable row level security;

-- =========================
-- DROP OLD POLICIES
-- =========================
drop policy if exists "Users and admins can read profiles" on public.profiles;
drop policy if exists "Users update own profile and admins update all profiles" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;

drop policy if exists "Authenticated users can read completed profile photos" on public.profile_photos;
drop policy if exists "Users can insert own profile photos" on public.profile_photos;
drop policy if exists "Users can update own profile photos" on public.profile_photos;
drop policy if exists "Users can delete own profile photos" on public.profile_photos;

drop policy if exists "Users can read own swipes" on public.swipes;
drop policy if exists "Users can insert own swipes" on public.swipes;
drop policy if exists "Users can update own swipes" on public.swipes;

drop policy if exists "Users can read own matches" on public.matches;
drop policy if exists "Users can read own conversations" on public.conversations;
drop policy if exists "Users can read own conversation memberships" on public.conversation_members;

drop policy if exists "Members can read messages in their conversations" on public.messages;
drop policy if exists "Members can insert messages in their conversations" on public.messages;
drop policy if exists "Members can update messages in their conversations" on public.messages;

drop policy if exists "Users can read their own intro requests" on public.intro_requests;

drop policy if exists "Users can insert own reports" on public.user_reports;
drop policy if exists "Users can read own reports" on public.user_reports;

drop policy if exists "Users can insert own blocks" on public.user_blocks;
drop policy if exists "Users can read own blocks" on public.user_blocks;
drop policy if exists "Users can delete own blocks" on public.user_blocks;

drop policy if exists "vip_requests_select_owner_or_admin" on public.vip_requests;
drop policy if exists "vip_requests_insert_own" on public.vip_requests;
drop policy if exists "vip_requests_update_owner_pending" on public.vip_requests;
drop policy if exists "vip_requests_admin_update" on public.vip_requests;

drop policy if exists "feed_posts_select_approved" on public.feed_posts;
drop policy if exists "feed_posts_insert_own" on public.feed_posts;

drop policy if exists "feed_post_likes_select" on public.feed_post_likes;
drop policy if exists "feed_post_likes_insert_own" on public.feed_post_likes;
drop policy if exists "feed_post_likes_delete_own" on public.feed_post_likes;

drop policy if exists "feed_post_comments_select" on public.feed_post_comments;
drop policy if exists "feed_post_comments_insert_own" on public.feed_post_comments;

drop policy if exists "feed_post_reports_select_own_or_admin" on public.feed_post_reports;
drop policy if exists "feed_post_reports_insert_own" on public.feed_post_reports;

drop policy if exists "notifications_select_own" on public.user_notifications;
drop policy if exists "notifications_update_own" on public.user_notifications;

-- =========================
-- PROFILES
-- =========================
create policy "Users and admins can read profiles"
on public.profiles
for select
to authenticated
using (
  auth.uid() = id
  or onboarding_completed = true
  or public.is_current_user_admin()
);

create policy "Users update own profile and admins update all profiles"
on public.profiles
for update
to authenticated
using (
  auth.uid() = id
  or public.is_current_user_admin()
)
with check (
  auth.uid() = id
  or public.is_current_user_admin()
);

create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

-- =========================
-- PROFILE PHOTOS
-- =========================
create policy "Authenticated users can read completed profile photos"
on public.profile_photos
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = profile_photos.user_id
      and p.onboarding_completed = true
  )
);

create policy "Users can insert own profile photos"
on public.profile_photos
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own profile photos"
on public.profile_photos
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own profile photos"
on public.profile_photos
for delete
to authenticated
using (auth.uid() = user_id);

-- =========================
-- SWIPES / MATCHES / CONVERSATIONS
-- =========================
create policy "Users can read own swipes"
on public.swipes
for select
to authenticated
using (auth.uid() = swiper_id);

create policy "Users can insert own swipes"
on public.swipes
for insert
to authenticated
with check (auth.uid() = swiper_id);

create policy "Users can update own swipes"
on public.swipes
for update
to authenticated
using (auth.uid() = swiper_id)
with check (auth.uid() = swiper_id);

create policy "Users can read own matches"
on public.matches
for select
to authenticated
using (auth.uid() = user_a or auth.uid() = user_b);

create policy "Users can read own conversations"
on public.conversations
for select
to authenticated
using (
  exists (
    select 1
    from public.conversation_members cm
    where cm.conversation_id = conversations.id
      and cm.user_id = auth.uid()
  )
);

create policy "Users can read own conversation memberships"
on public.conversation_members
for select
to authenticated
using (auth.uid() = user_id);

-- =========================
-- MESSAGES
-- =========================
create policy "Members can read messages in their conversations"
on public.messages
for select
to authenticated
using (
  exists (
    select 1
    from public.conversation_members cm
    where cm.conversation_id = messages.conversation_id
      and cm.user_id = auth.uid()
  )
);

create policy "Members can insert messages in their conversations"
on public.messages
for insert
to authenticated
with check (
  sender_id = auth.uid()
  and exists (
    select 1
    from public.conversation_members cm
    where cm.conversation_id = messages.conversation_id
      and cm.user_id = auth.uid()
  )
);

create policy "Members can update messages in their conversations"
on public.messages
for update
to authenticated
using (
  exists (
    select 1
    from public.conversation_members cm
    where cm.conversation_id = messages.conversation_id
      and cm.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.conversation_members cm
    where cm.conversation_id = messages.conversation_id
      and cm.user_id = auth.uid()
  )
);

-- =========================
-- INTRO REQUESTS
-- =========================
create policy "Users can read their own intro requests"
on public.intro_requests
for select
to authenticated
using (auth.uid() = initiator_id or auth.uid() = recipient_id);

-- =========================
-- REPORTS / BLOCKS
-- =========================
create policy "Users can insert own reports"
on public.user_reports
for insert
to authenticated
with check (auth.uid() = reporter_id);

create policy "Users can read own reports"
on public.user_reports
for select
to authenticated
using (auth.uid() = reporter_id);

create policy "Users can insert own blocks"
on public.user_blocks
for insert
to authenticated
with check (auth.uid() = blocker_id);

create policy "Users can read own blocks"
on public.user_blocks
for select
to authenticated
using (auth.uid() = blocker_id);

create policy "Users can delete own blocks"
on public.user_blocks
for delete
to authenticated
using (auth.uid() = blocker_id);

-- =========================
-- VIP REQUESTS
-- =========================
create policy "vip_requests_select_owner_or_admin"
on public.vip_requests
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_current_user_admin()
);

create policy "vip_requests_insert_own"
on public.vip_requests
for insert
to authenticated
with check (user_id = auth.uid());

create policy "vip_requests_update_owner_pending"
on public.vip_requests
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "vip_requests_admin_update"
on public.vip_requests
for update
to authenticated
using (public.is_current_user_admin())
with check (public.is_current_user_admin());

-- =========================
-- FEED
-- =========================
create policy "feed_posts_select_approved"
on public.feed_posts
for select
to authenticated
using (
  status = 'approved'
  and is_hidden_by_admin = false
);

create policy "feed_posts_insert_own"
on public.feed_posts
for insert
to authenticated
with check (user_id = auth.uid());

create policy "feed_post_likes_select"
on public.feed_post_likes
for select
to authenticated
using (true);

create policy "feed_post_likes_insert_own"
on public.feed_post_likes
for insert
to authenticated
with check (user_id = auth.uid());

create policy "feed_post_likes_delete_own"
on public.feed_post_likes
for delete
to authenticated
using (user_id = auth.uid());

create policy "feed_post_comments_select"
on public.feed_post_comments
for select
to authenticated
using (is_hidden = false);

create policy "feed_post_comments_insert_own"
on public.feed_post_comments
for insert
to authenticated
with check (user_id = auth.uid());

create policy "feed_post_reports_select_own_or_admin"
on public.feed_post_reports
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_current_user_admin()
);

create policy "feed_post_reports_insert_own"
on public.feed_post_reports
for insert
to authenticated
with check (user_id = auth.uid());

-- =========================
-- NOTIFICATIONS
-- =========================
create policy "notifications_select_own"
on public.user_notifications
for select
to authenticated
using (auth.uid() = user_id);

create policy "notifications_update_own"
on public.user_notifications
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- =========================
-- STORAGE POLICIES
-- =========================

-- AVATARS
drop policy if exists "Avatar images are publicly readable" on storage.objects;
drop policy if exists "Users can upload their own avatar" on storage.objects;
drop policy if exists "Users can update their own avatar" on storage.objects;
drop policy if exists "Users can delete their own avatar" on storage.objects;

create policy "Avatar images are publicly readable"
on storage.objects
for select
to authenticated
using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can update their own avatar"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete their own avatar"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- PROFILE PHOTOS
drop policy if exists "Profile photos are readable by authenticated users" on storage.objects;
drop policy if exists "Users can upload their own profile photos" on storage.objects;
drop policy if exists "Users can update their own profile photos" on storage.objects;
drop policy if exists "Users can delete their own profile photos" on storage.objects;

create policy "Profile photos are readable by authenticated users"
on storage.objects
for select
to authenticated
using (bucket_id = 'profile-photos');

create policy "Users can upload their own profile photos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can update their own profile photos"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete their own profile photos"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- VIP VERIFICATION
drop policy if exists "vip_verification_insert_own" on storage.objects;
drop policy if exists "vip_verification_select_own_or_admin" on storage.objects;
drop policy if exists "vip_verification_delete_own_or_admin" on storage.objects;

create policy "vip_verification_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'vip-verification'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "vip_verification_select_own_or_admin"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'vip-verification'
  and (
    auth.uid()::text = (storage.foldername(name))[1]
    or public.is_current_user_admin()
  )
);

create policy "vip_verification_delete_own_or_admin"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'vip-verification'
  and (
    auth.uid()::text = (storage.foldername(name))[1]
    or public.is_current_user_admin()
  )
);

-- FEED IMAGES
drop policy if exists "feed_images_select_authenticated" on storage.objects;
drop policy if exists "feed_images_insert_own_folder" on storage.objects;
drop policy if exists "feed_images_update_own_folder" on storage.objects;
drop policy if exists "feed_images_delete_own_folder" on storage.objects;

create policy "feed_images_select_authenticated"
on storage.objects
for select
to authenticated
using (bucket_id = 'feed-images');

create policy "feed_images_insert_own_folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'feed-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "feed_images_update_own_folder"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'feed-images'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'feed-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "feed_images_delete_own_folder"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'feed-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);