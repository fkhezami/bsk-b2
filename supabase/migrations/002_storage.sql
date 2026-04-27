-- Create private storage bucket for uploaded images
insert into storage.buckets (id, name, public)
values ('course-images', 'course-images', false);

-- Anyone can upload to the bucket (public upload link)
create policy "anyone can upload course images"
  on storage.objects for insert
  with check (bucket_id = 'course-images');

-- Only authenticated users (admin via service key) can read images
create policy "authenticated users can read course images"
  on storage.objects for select
  using (bucket_id = 'course-images' and auth.role() = 'authenticated');

-- Service role can delete
create policy "service role can delete course images"
  on storage.objects for delete
  using (bucket_id = 'course-images');
