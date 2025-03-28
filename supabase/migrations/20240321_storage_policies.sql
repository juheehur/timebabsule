-- Enable storage
create extension if not exists "uuid-ossp";

-- Create a storage bucket for capsule images
insert into storage.buckets (id, name, public) 
values ('capsule_images', 'capsule_images', true);

-- Set up security policies
create policy "Images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'capsule_images' );

create policy "Users can upload images"
  on storage.objects for insert
  with check (
    bucket_id = 'capsule_images' 
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update their own images"
  on storage.objects for update
  using (
    bucket_id = 'capsule_images' 
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own images"
  on storage.objects for delete
  using (
    bucket_id = 'capsule_images' 
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  ); 