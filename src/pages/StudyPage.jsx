import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchWordBooks, fetchEntriesForStudy } from '../lib/api'
import LoadingSpinner from '../components/LoadingSpinner'
import PronounceButton from '../components/PronounceButton'

const MODES = {
  EN_TO_ZH: 'en_zh',
  ZH_TO_EN: 'zh_en',
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function StudyPage() {
  const { user } = useAuth()
  const [books, setBooks] = useState([])
  const [bookId, setBookId] = useState('')
  const [mode, setMode] = useState(MODES.EN_TO_ZH)
  const [cards, setCards] = useState([])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [started, setStarted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchWordBooks(user.id).then(setBooks).catch((e) => alert(e.message))
  }, [user.id])

  const current = cards[index]
  const progress = cards.length ? ((index + 1) / cards.length) * 100 : 0

  const frontText = useMemo(() => {
    if (!current) return ''
    return mode === MODES.EN_TO_ZH ? current.word : current.meaning
  }, [current, mode])

  const backText = useMemo(() => {
    if (!current) return ''
    return mode === MODES.EN_TO_ZH ? current.meaning : current.word
  }, [current, mode])

  const startStudy = async () => {
    if (!bookId) {
      alert('请选择单词本')
      return
    }
    setLoading(true)
    try {
      const entries = await fetchEntriesForStudy(bookId, user.id)
      if (!entries.length) {
        alert('该单词本没有单词')
        return
      }
      setCards(shuffle(entries))
      setIndex(0)
      setFlipped(false)
      setStarted(true)
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  const goNext = () => {
    if (index < cards.length - 1) {
      setIndex(index + 1)
      setFlipped(false)
    }
  }

  if (!started) {
    return (
      <div className="page-wrap safe-top">
        <h1 className="page-title">学习</h1>

        <p className="section-label">选择题库</p>
        <select
          value={bookId}
          onChange={(e) => setBookId(e.target.value)}
          className="input-field-plain mb-6"
        >
          <option value="">— 选择单词本 —</option>
          {books.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} ({b.word_count} 词)
            </option>
          ))}
        </select>

        <p className="section-label">学习模式</p>
        <div className="mb-8 flex gap-3">
          {[
            { id: MODES.EN_TO_ZH, label: 'English → Chinese', sub: '英译中' },
            { id: MODES.ZH_TO_EN, label: 'Chinese → English', sub: '中译英' },
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`mode-card ${mode === m.id ? 'selected' : ''}`}
            >
              <p className="text-xs font-medium text-[#7EB1B1]">{m.sub}</p>
              <p className="mt-1 text-[11px] leading-tight text-[#3d3d3d]">{m.label}</p>
            </button>
          ))}
        </div>

        <button type="button" onClick={startStudy} disabled={loading} className="btn-primary">
          {loading ? '加载中...' : '开始学习'}
        </button>
      </div>
    )
  }

  return (
    <div className="safe-top flex min-h-[calc(100vh-72px)] flex-col px-5 py-6">
      <div className="mx-auto w-full max-w-[480px] flex-1 flex flex-col">
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => { setStarted(false); setCards([]) }}
            className="back-link !mb-0"
          >
            ← 退出
          </button>
          <span className="text-sm text-[#9CA3AF]">
            {index + 1} / {cards.length}
          </span>
        </div>

        <div className="progress-track mb-8">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flip-card w-full max-w-sm cursor-pointer" onClick={() => setFlipped(!flipped)}>
            <div className={`flip-card-inner ${flipped ? 'flipped' : ''}`}>
              <div className="flip-card-front">
                {mode === MODES.EN_TO_ZH && current && (
                  <div className="absolute right-5 top-5">
                    <PronounceButton word={current.word} />
                  </div>
                )}
                <p className={`text-center leading-relaxed text-[#3d3d3d] ${mode === MODES.EN_TO_ZH ? 'font-serif text-3xl font-semibold' : 'text-lg'}`}>
                  {frontText}
                </p>
                {!flipped && (
                  <p className="absolute bottom-5 text-xs text-[#9CA3AF]">点击翻转查看答案</p>
                )}
              </div>
              <div className="flip-card-back">
                <p className={`text-center leading-relaxed text-[#3d3d3d] ${mode === MODES.ZH_TO_EN ? 'font-serif text-3xl font-semibold' : 'text-base'}`}>
                  {backText}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3 pb-4">
          <button
            type="button"
            onClick={goNext}
            className="btn-secondary flex-1 !w-auto"
          >
            不认识
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={index >= cards.length - 1}
            className="btn-primary flex-1 !w-auto disabled:opacity-40"
          >
            认识
          </button>
        </div>
      </div>
    </div>
  )
}
