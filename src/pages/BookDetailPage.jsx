import { useEffect, useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  fetchWordEntriesByBook,
  reorderWordEntries,
  deleteWordEntry,
} from '../lib/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { IconChevronLeft, IconChevronUp, IconChevronDown, IconMore } from '../components/Icons'

const sortBtnClass =
  'flex h-8 w-8 items-center justify-center rounded-lg border border-[#f0ebe3] bg-white text-[#7EB1B1] transition active:bg-[#fdfcf8] disabled:opacity-30 disabled:pointer-events-none'

export default function BookDetailPage() {
  const { bookId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [menuId, setMenuId] = useState(null)

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

  useEffect(() => {
    if (!menuId) return
    const close = () => setMenuId(null)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [menuId])

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
    setMenuId(null)
    try {
      await reorderWordEntries(user.id, reordered.map((e) => e.id))
    } catch (e) {
      alert(e.message)
      load()
    }
  }

  const handleDelete = async (entry) => {
    setMenuId(null)
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
    <section className="page-wrap safe-top pb-20">
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
        <ul className="mb-4 space-y-0 divide-y divide-[#f0ebe3] rounded-2xl border border-[#f0ebe3] bg-white overflow-hidden">
          {filtered.map((entry) => {
            const index = entries.findIndex((e) => e.id === entry.id)
            return (
              <li key={entry.id} className="relative">
                <section className="flex items-center gap-1 pr-1">
                  <button
                    type="button"
                    onClick={() => navigate(`/word/${entry.id}`)}
                    className="flex min-w-0 flex-1 items-center justify-between gap-3 px-4 py-4 text-left transition active:bg-[#fdfcf8]"
                  >
                    <span className="font-serif text-lg font-medium text-[#3d3d3d]">{entry.word}</span>
                    <span className="line-clamp-1 flex-1 text-right text-sm text-[#9CA3AF]">
                      {previewMeaning(entry.meaning)}
                    </span>
                  </button>

                  {canReorder && (
                    <section className="flex shrink-0 flex-col gap-1 py-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          moveEntry(index, -1)
                        }}
                        disabled={index === 0}
                        className={sortBtnClass}
                        aria-label={`${entry.word} 上移`}
                      >
                        <IconChevronUp />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          moveEntry(index, 1)
                        }}
                        disabled={index === entries.length - 1}
                        className={sortBtnClass}
                        aria-label={`${entry.word} 下移`}
                      >
                        <IconChevronDown />
                      </button>
                    </section>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setMenuId(menuId === entry.id ? null : entry.id)
                    }}
                    className="shrink-0 px-2 py-4 text-[#9CA3AF]"
                    aria-label="更多操作"
                  >
                    <IconMore />
                  </button>
                </section>

                {menuId === entry.id && (
                  <section
                    className="absolute right-3 top-12 z-10 min-w-[7rem] rounded-xl border border-[#f0ebe3] bg-white py-1 shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => handleDelete(entry)}
                      className="block w-full px-4 py-2 text-left text-sm text-[#e57373]"
                    >
                      删除单词
                    </button>
                  </section>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
