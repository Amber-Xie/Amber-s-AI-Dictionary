import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  fetchWordEntry,
  fetchWordEntriesByBook,
  updateLinkedEntries,
} from '../lib/api'
import WordResultCard from '../components/WordResultCard'
import NotesSection from '../components/NotesSection'
import LoadingSpinner from '../components/LoadingSpinner'
import { IconChevronLeft } from '../components/Icons'

export default function WordDetailPage() {
  const { wordId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [entry, setEntry] = useState(null)
  const [siblings, setSiblings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showLinkPicker, setShowLinkPicker] = useState(false)
  const [selectedLinks, setSelectedLinks] = useState([])
  const [linkedEntries, setLinkedEntries] = useState([])

  const loadEntry = async () => {
    const data = await fetchWordEntry(wordId, user.id)
    setEntry(data)

    const allInBook = await fetchWordEntriesByBook(data.book_id, user.id)
    setSiblings(allInBook.filter((e) => e.id !== data.id))

    const outgoing = data.linked_entry_ids || []
    const incomingIds = allInBook
      .filter((e) => e.id !== data.id && (e.linked_entry_ids || []).includes(data.id))
      .map((e) => e.id)
    const allLinkedIds = [...new Set([...outgoing, ...incomingIds])]

    setSelectedLinks(allLinkedIds)
    setLinkedEntries(allInBook.filter((e) => allLinkedIds.includes(e.id)))
  }

  useEffect(() => {
    loadEntry()
      .catch((e) => alert(e.message))
      .finally(() => setLoading(false))
  }, [wordId, user.id])

  const toggleLink = (id) => {
    setSelectedLinks((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const saveLinks = async () => {
    try {
      await updateLinkedEntries(wordId, user.id, selectedLinks)
      setShowLinkPicker(false)
      await loadEntry()
    } catch (e) {
      alert(e.message)
    }
  }

  if (loading) return <div className="page-wrap"><LoadingSpinner /></div>
  if (!entry) return <p className="p-8 text-center text-[#9CA3AF]">单词不存在</p>

  const result = {
    meaning: entry.meaning,
    insight: entry.insight,
    examples: entry.examples || [],
  }

  return (
    <div className="page-wrap safe-top pb-10">
      <button type="button" onClick={() => navigate(-1)} className="back-link">
        <IconChevronLeft /> 返回
      </button>

      <WordResultCard word={entry.word} result={result} compact />

      <article className="card mt-3">
        <div className="mb-3 flex items-center justify-between">
          <p className="section-label !mb-0">相关单词</p>
          <button type="button" onClick={() => setShowLinkPicker(!showLinkPicker)} className="btn-ghost text-xs">
            {showLinkPicker ? '收起' : '链接单词'}
          </button>
        </div>

        {showLinkPicker && (
          <div className="mb-3 max-h-44 overflow-y-auto rounded-xl border border-[#f0ebe3] p-2">
            {siblings.length === 0 ? (
              <p className="text-sm text-[#9CA3AF]">同本暂无其他单词</p>
            ) : (
              siblings.map((s) => (
                <label key={s.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2.5 hover:bg-[#fdfcf8]">
                  <input
                    type="checkbox"
                    checked={selectedLinks.includes(s.id)}
                    onChange={() => toggleLink(s.id)}
                    className="accent-[#7EB1B1]"
                  />
                  <span className="font-serif text-sm text-[#3d3d3d]">{s.word}</span>
                </label>
              ))
            )}
            <button type="button" onClick={saveLinks} className="btn-primary !mt-2 !py-2.5 !text-sm">
              保存链接
            </button>
          </div>
        )}

        {linkedEntries.length > 0 ? (
          <div className="space-y-2">
            {linkedEntries.map((le) => (
              <button
                key={le.id}
                type="button"
                onClick={() => navigate(`/word/${le.id}`)}
                className="flex w-full items-center justify-between rounded-xl border border-[#f0ebe3] px-4 py-3 text-left transition active:bg-[#fdfcf8]"
              >
                <span className="font-serif font-medium text-[#3d3d3d]">{le.word}</span>
                <span className="text-xs text-[#9CA3AF]">查看 →</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#9CA3AF]">暂无链接单词</p>
        )}
      </article>

      <NotesSection entry={entry} onUpdate={setEntry} />
    </div>
  )
}
