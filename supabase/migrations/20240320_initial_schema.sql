-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create time_capsules table
create table time_capsules (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  letter_content text not null,
  image_url text not null,
  comic_url text,
  open_date timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create friend_messages table
create table friend_messages (
  id uuid default uuid_generate_v4() primary key,
  time_capsule_id uuid references time_capsules(id) on delete cascade not null,
  sender_name text not null,
  message_content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create RLS policies
alter table profiles enable row level security;
alter table time_capsules enable row level security;
alter table friend_messages enable row level security;

-- Profiles policies
create policy "Users can view their own profile"
  on profiles for select
  using ( auth.uid() = id );

create policy "Users can update their own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Time capsules policies
create policy "Users can view their own time capsules"
  on time_capsules for select
  using ( auth.uid() = user_id );

create policy "Users can create time capsules"
  on time_capsules for insert
  with check ( auth.uid() = user_id );

-- Friend messages policies
create policy "Anyone can create friend messages"
  on friend_messages for insert
  with check ( true );

create policy "Users can view messages for their time capsules"
  on friend_messages for select
  using (
    exists (
      select 1 from time_capsules
      where time_capsules.id = friend_messages.time_capsule_id
      and time_capsules.user_id = auth.uid()
    )
  );

-- Create functions
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Create triggers
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user(); 