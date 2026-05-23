import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchWordEntriesByBook } from '../lib/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { IconChevronLeft } from '../components/Icons'

export default function BookDetailPage() {
  const { bookId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    fetchWordEntriesByBook(bookId, user.id)
      .then(setEntries)
      .catch((e) => alert(e.message))
      .finally(() => setLoading(false))
  }, [bookId, user.id])

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return entries
    return entries.filter(
      (e) =>
        e.word.toLowerCase().includes(q) ||
        e.meaning?.toLowerCase().includes(q)
    )
  }, [entries, filter])

  return (
    <div className="page-wrap safe-top pb-8">
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

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <p className="py-12 text-center text-[#9CA3AF]">
          {entries.length === 0 ? '这本还没有单词' : '没有匹配的单词'}
        </p>
      ) : (
        <ul className="space-y-0 divide-y divide-[#f0ebe3] rounded-2xl border border-[#f0ebe3] bg-white overflow-hidden">
          {filtered.map((entry) => (
            <li key={entry.id}>
              <button
                type="button"
                onClick={() => navigate(`/word/${entry.id}`)}
                className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition active:bg-[#fdfcf8]"
              >
                <span className="font-serif text-lg font-medium text-[#3d3d3d]">{entry.word}</span>
                <span className="line-clamp-1 flex-1 text-right text-sm text-[#9CA3AF]">
                  {entry.meaning?.split('；')[0]?.split(';')[0]}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
