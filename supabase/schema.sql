-- 在 Supabase SQL Editor 中执行（如尚未创建表）

-- 单词本
create table if not exists public.word_books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 单词条目
create table if not exists public.word_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id uuid not null references public.word_books(id) on delete cascade,
  word text not null,
  meaning text not null,
  insight text,
  examples jsonb default '[]'::jsonb,
  linked_entry_ids uuid[] default '{}',
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 索引
create index if not exists idx_word_books_user on public.word_books(user_id);
create index if not exists idx_word_entries_user on public.word_entries(user_id);
create index if not exists idx_word_entries_book on public.word_entries(book_id);
create index if not exists idx_word_entries_book_sort on public.word_entries(book_id, sort_order);

-- 已有数据库执行此迁移（添加单词排序字段）：
-- alter table public.word_entries add column if not exists sort_order integer not null default 0;
-- create index if not exists idx_word_entries_book_sort on public.word_entries(book_id, sort_order);

-- 启用 RLS
alter table public.word_books enable row level security;
alter table public.word_entries enable row level security;

-- word_books 策略
create policy "Users can view own books"
  on public.word_books for select
  using (auth.uid() = user_id);

create policy "Users can insert own books"
  on public.word_books for insert
  with check (auth.uid() = user_id);

create policy "Users can update own books"
  on public.word_books for update
  using (auth.uid() = user_id);

create policy "Users can delete own books"
  on public.word_books for delete
  using (auth.uid() = user_id);

-- word_entries 策略（UPDATE 需要 SELECT）
create policy "Users can view own entries"
  on public.word_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert own entries"
  on public.word_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update own entries"
  on public.word_entries for update
  using (auth.uid() = user_id);

create policy "Users can delete own entries"
  on public.word_entries for delete
  using (auth.uid() = user_id);
