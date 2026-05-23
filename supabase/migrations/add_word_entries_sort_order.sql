-- 在 Supabase Dashboard → SQL Editor 中执行此脚本
-- 为 word_entries 添加排序字段（修复 sort_order 报错）

alter table public.word_entries
  add column if not exists sort_order integer not null default 0;

create index if not exists idx_word_entries_book_sort
  on public.word_entries(book_id, sort_order);

-- 按创建时间为已有单词补排序序号
with ranked as (
  select
    id,
    row_number() over (
      partition by book_id
      order by created_at asc, id asc
    ) - 1 as new_sort_order
  from public.word_entries
)
update public.word_entries e
set sort_order = ranked.new_sort_order
from ranked
where e.id = ranked.id;
