import { supabase } from './supabase'

/** @returns {Promise<string|null>} */
export function getDeepSeekApiKey(user) {
  return user?.user_metadata?.deepseek_api_key || null
}

function missingSortOrderColumn(error) {
  const msg = error?.message || ''
  return msg.includes('sort_order') && (
    msg.includes('schema cache') ||
    msg.includes('Could not find') ||
    msg.includes('column')
  )
}

const SORT_ORDER_MIGRATION_HINT =
  '单词排序需要数据库迁移：请在 Supabase → SQL Editor 执行 supabase/migrations/add_word_entries_sort_order.sql'

// ——— Word Books ———

export async function fetchWordBooks(userId) {
  const { data, error } = await supabase
    .from('word_books')
    .select('*, word_entries(count)')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return (data || []).map((book) => ({
    ...book,
    word_count: book.word_entries?.[0]?.count ?? 0,
  }))
}

export async function createWordBook(userId, name) {
  const { data: existing } = await supabase
    .from('word_books')
    .select('sort_order')
    .eq('user_id', userId)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextOrder = (existing?.[0]?.sort_order ?? -1) + 1

  const { data, error } = await supabase
    .from('word_books')
    .insert({ user_id: userId, name: name.trim(), sort_order: nextOrder })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateWordBookName(bookId, userId, name) {
  const { error } = await supabase
    .from('word_books')
    .update({ name: name.trim() })
    .eq('id', bookId)
    .eq('user_id', userId)

  if (error) throw error
}

export async function reorderWordBooks(userId, orderedIds) {
  const updates = orderedIds.map((id, index) =>
    supabase
      .from('word_books')
      .update({ sort_order: index })
      .eq('id', id)
      .eq('user_id', userId)
  )
  const results = await Promise.all(updates)
  const failed = results.find((r) => r.error)
  if (failed?.error) throw failed.error
}

export async function deleteWordBook(bookId, userId) {
  const { error } = await supabase
    .from('word_books')
    .delete()
    .eq('id', bookId)
    .eq('user_id', userId)

  if (error) throw error
}

// ——— Word Entries ———

export async function fetchWordEntriesByBook(bookId, userId) {
  const baseQuery = () =>
    supabase
      .from('word_entries')
      .select('*')
      .eq('book_id', bookId)
      .eq('user_id', userId)

  let { data, error } = await baseQuery()
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (missingSortOrderColumn(error)) {
    ({ data, error } = await baseQuery().order('created_at', { ascending: true }))
  }

  if (error) throw error
  return data || []
}

export async function fetchWordEntry(wordId, userId) {
  const { data, error } = await supabase
    .from('word_entries')
    .select('*')
    .eq('id', wordId)
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data
}

export async function saveWordEntry({
  userId,
  bookId,
  word,
  meaning,
  insight,
  examples,
}) {
  const basePayload = {
    user_id: userId,
    book_id: bookId,
    word: word.trim(),
    meaning,
    insight,
    examples,
    linked_entry_ids: [],
    notes: null,
  }

  const { data: existing, error: existingError } = await supabase
    .from('word_entries')
    .select('sort_order')
    .eq('book_id', bookId)
    .eq('user_id', userId)
    .order('sort_order', { ascending: false })
    .limit(1)

  let payload = basePayload
  if (!missingSortOrderColumn(existingError)) {
    if (existingError) throw existingError
    const nextOrder = (existing?.[0]?.sort_order ?? -1) + 1
    payload = { ...basePayload, sort_order: nextOrder }
  }

  let { data, error } = await supabase
    .from('word_entries')
    .insert(payload)
    .select()
    .single()

  if (missingSortOrderColumn(error) && payload !== basePayload) {
    ({ data, error } = await supabase
      .from('word_entries')
      .insert(basePayload)
      .select()
      .single())
  }

  if (error) throw error
  return data
}

export async function updateWordEntryNotes(wordId, userId, notes) {
  const { data, error } = await supabase
    .from('word_entries')
    .update({ notes: notes || null })
    .eq('id', wordId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

async function syncAddReverseLink(targetId, sourceId, userId) {
  const { data: target, error } = await supabase
    .from('word_entries')
    .select('linked_entry_ids')
    .eq('id', targetId)
    .eq('user_id', userId)
    .single()

  if (error) throw error
  const ids = target.linked_entry_ids || []
  if (ids.includes(sourceId)) return

  const { error: updateError } = await supabase
    .from('word_entries')
    .update({ linked_entry_ids: [...ids, sourceId] })
    .eq('id', targetId)
    .eq('user_id', userId)

  if (updateError) throw updateError
}

async function syncRemoveReverseLink(targetId, sourceId, userId) {
  const { data: target, error } = await supabase
    .from('word_entries')
    .select('linked_entry_ids')
    .eq('id', targetId)
    .eq('user_id', userId)
    .single()

  if (error) throw error
  const ids = (target.linked_entry_ids || []).filter((id) => id !== sourceId)
  if (ids.length === (target.linked_entry_ids || []).length) return

  const { error: updateError } = await supabase
    .from('word_entries')
    .update({ linked_entry_ids: ids })
    .eq('id', targetId)
    .eq('user_id', userId)

  if (updateError) throw updateError
}

export async function updateLinkedEntries(wordId, userId, linkedEntryIds) {
  const { data: current, error: fetchError } = await supabase
    .from('word_entries')
    .select('book_id, linked_entry_ids')
    .eq('id', wordId)
    .eq('user_id', userId)
    .single()

  if (fetchError) throw fetchError

  const { data: allInBook, error: bookError } = await supabase
    .from('word_entries')
    .select('id, linked_entry_ids')
    .eq('book_id', current.book_id)
    .eq('user_id', userId)

  if (bookError) throw bookError

  const outgoing = current.linked_entry_ids || []
  const incomingIds = (allInBook || [])
    .filter((e) => e.id !== wordId && (e.linked_entry_ids || []).includes(wordId))
    .map((e) => e.id)
  const previousAll = [...new Set([...outgoing, ...incomingIds])]

  const newIds = linkedEntryIds || []
  const added = newIds.filter((id) => !previousAll.includes(id))
  const removed = previousAll.filter((id) => !newIds.includes(id))

  const { data, error } = await supabase
    .from('word_entries')
    .update({ linked_entry_ids: newIds })
    .eq('id', wordId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error

  await Promise.all([
    ...added.map((targetId) => syncAddReverseLink(targetId, wordId, userId)),
    ...removed.map((targetId) => syncRemoveReverseLink(targetId, wordId, userId)),
  ])

  return data
}

export async function reorderWordEntries(userId, orderedIds) {
  const updates = orderedIds.map((id, index) =>
    supabase
      .from('word_entries')
      .update({ sort_order: index })
      .eq('id', id)
      .eq('user_id', userId)
  )
  const results = await Promise.all(updates)
  const failed = results.find((r) => r.error)
  if (failed?.error) {
    if (missingSortOrderColumn(failed.error)) {
      throw new Error(SORT_ORDER_MIGRATION_HINT)
    }
    throw failed.error
  }
}

export async function deleteWordEntry(entryId, userId) {
  const { data: entry, error: fetchError } = await supabase
    .from('word_entries')
    .select('linked_entry_ids')
    .eq('id', entryId)
    .eq('user_id', userId)
    .single()

  if (fetchError) throw fetchError

  const linked = entry?.linked_entry_ids || []
  await Promise.all(
    linked.map((targetId) => syncRemoveReverseLink(targetId, entryId, userId))
  )

  const { data: referrers, error: referrersError } = await supabase
    .from('word_entries')
    .select('id, linked_entry_ids')
    .eq('user_id', userId)
    .contains('linked_entry_ids', [entryId])

  if (referrersError) throw referrersError

  await Promise.all(
    (referrers || []).map(({ id, linked_entry_ids }) =>
      supabase
        .from('word_entries')
        .update({
          linked_entry_ids: (linked_entry_ids || []).filter((id) => id !== entryId),
        })
        .eq('id', id)
        .eq('user_id', userId)
    )
  )

  const { error } = await supabase
    .from('word_entries')
    .delete()
    .eq('id', entryId)
    .eq('user_id', userId)

  if (error) throw error
}

export async function fetchEntriesForStudy(bookId, userId) {
  const { data, error } = await supabase
    .from('word_entries')
    .select('id, word, meaning')
    .eq('book_id', bookId)
    .eq('user_id', userId)

  if (error) throw error
  return data || []
}
