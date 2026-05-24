import { useEffect, useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  fetchWordEntriesByBook,
  reorderWordEntries,
  deleteWordEntry,
} from '../lib/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { IconChevronLeft, IconChevronUp, IconChevronDown } from '../components/Icons'

const sortBtnClass =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#f0ebe3] bg-[#fdfcf8] text-[#7EB1B1] transition active:bg-[#e8f2f2] disabled:opacity-30 disabled:pointer-events-none'

export default function BookDetailPage() {
  const { bookId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchWordEntriesByBook(bookId, user.id)
      setEntries(data)
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }, [bookId, user.id])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return entries
    return entries.filter(
      (e) =>
        e.word.toLowerCase().includes(q) ||
        e.meaning?.toLowerCase().includes(q)
    )
  }, [entries, filter])

  const canReorder = !filter.trim()

  const moveEntry = async (index, direction) => {
    if (!canReorder) return
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= entries.length) return
    const reordered = [...entries]
    const [item] = reordered.splice(index, 1)
    reordered.splice(newIndex, 0, item)
    setEntries(reordered)
    try {
      await reorderWordEntries(user.id, reordered.map((e) => e.id))
    } catch (e) {
      alert(e.message)
      load()
    }
  }

  const handleDelete = async (entry) => {
    if (!window.confirm(`确定删除单词「${entry.word}」吗？`)) return
    try {
      await deleteWordEntry(entry.id, user.id)
      load()
    } catch (e) {
      alert(e.message)
    }
  }

  const previewMeaning = (meaning) =>
    meaning?.split('\n')[0]?.split('；')[0]?.split(';')[0]

  return (
    <section className="page-wrap safe-top">
      <button type="button" onClick={() => navigate('/books')} className="back-link">
        <IconChevronLeft /> 返回
      </button>

      <h1 className="page-title">单词列表</h1>

      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="搜索本内单词..."
        className="input-field-plain mb-5"
      />

      {filter.trim() && (
        <p className="mb-4 text-xs text-[#9CA3AF]">搜索模式下无法调整排序，清空搜索后可排序</p>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <p className="py-12 text-center text-[#9CA3AF]">
          {entries.length === 0 ? '这本还没有单词' : '没有匹配的单词'}
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((entry) => {
            const index = entries.findIndex((e) => e.id === entry.id)
            return (
              <li
                key={entry.id}
                className="rounded-2xl border border-[#f0ebe3] bg-white"
              >
                <section className="flex items-center gap-2 p-3">
                  <button
                    type="button"
                    onClick={() => navigate(`/word/${entry.id}`)}
                    className="min-w-0 flex-1 text-left transition active:opacity-80"
                  >
                    <p className="font-serif text-lg font-medium text-[#3d3d3d]">{entry.word}</p>
                    <p className="mt-0.5 line-clamp-2 text-sm text-[#9CA3AF]">
                      {previewMeaning(entry.meaning)}
                    </p>
                  </button>

                  <section className="flex shrink-0 items-center gap-1 border-l border-[#f0ebe3] pl-2">
                    {canReorder && (
                      <>
                        <button
                          type="button"
                          onClick={() => moveEntry(index, -1)}
                          disabled={index === 0}
                          className={sortBtnClass}
                          aria-label={`${entry.word} 上移`}
                        >
                          <IconChevronUp />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveEntry(index, 1)}
                          disabled={index === entries.length - 1}
                          className={sortBtnClass}
                          aria-label={`${entry.word} 下移`}
                        >
                          <IconChevronDown />
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(entry)}
                      className="whitespace-nowrap rounded-lg px-2 py-1.5 text-xs font-medium text-[#e57373] transition active:bg-[#fef2f2]"
                    >
                      删除
                    </button>
                  </section>
                </section>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
