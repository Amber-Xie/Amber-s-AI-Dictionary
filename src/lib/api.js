import { supabase } from './supabase'

/** @returns {Promise<string|null>} */
export function getDeepSeekApiKey(user) {
  return user?.user_metadata?.deepseek_api_key || null
}

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

// ——— Word Entries ———

export async function fetchWordEntriesByBook(bookId, userId) {
  const { data, error } = await supabase
    .from('word_entries')
    .select('*')
    .eq('book_id', bookId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

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
  const { data, error } = await supabase
    .from('word_entries')
    .insert({
      user_id: userId,
      book_id: bookId,
      word: word.trim(),
      meaning,
      insight,
      examples,
      linked_entry_ids: [],
      notes: null,
    })
    .select()
    .single()

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

export async function updateLinkedEntries(wordId, userId, linkedEntryIds) {
  const { data, error } = await supabase
    .from('word_entries')
    .update({ linked_entry_ids: linkedEntryIds })
    .eq('id', wordId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
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
