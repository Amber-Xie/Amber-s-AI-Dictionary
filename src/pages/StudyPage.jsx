import { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchWordBooks, fetchEntriesForStudy } from '../lib/api'
import PronounceButton from '../components/PronounceButton'
import { IconChevronLeft, IconChevronRight } from '../components/Icons'

const MODES = {
  EN_TO_ZH: 'en_zh',
  ZH_TO_EN: 'zh_en',
}

const SWIPE_THRESHOLD = 50

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
  const touchStartX = useRef(null)

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

  const exitStudy = useCallback(() => {
    setStarted(false)
    setCards([])
    setIndex(0)
    setFlipped(false)
  }, [])

  const goPrev = useCallback(() => {
    if (index > 0) {
      setIndex((i) => i - 1)
      setFlipped(false)
    }
  }, [index])

  const goNext = useCallback(() => {
    if (index < cards.length - 1) {
      setIndex((i) => i + 1)
      setFlipped(false)
    }
  }, [index, cards.length])

  useEffect(() => {
    if (!started) return
    const onKeyDown = (e) => {
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'Escape') exitStudy()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [started, goPrev, goNext, exitStudy])

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

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e) => {
    if (touchStartX.current == null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(delta) < SWIPE_THRESHOLD) return
    if (delta > 0) goPrev()
    else goNext()
  }

  if (!started) {
    return (
      <section className="page-wrap safe-top">
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
        <section className="mb-8 flex gap-3">
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
        </section>

        <button type="button" onClick={startStudy} disabled={loading} className="btn-primary">
          {loading ? '加载中...' : '开始学习'}
        </button>
      </section>
    )
  }

  return (
    <section className="safe-top flex min-h-[calc(100vh-72px)] flex-col px-5 py-6">
      <section className="mx-auto w-full max-w-[480px] flex-1 flex flex-col">
        <header className="mb-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={exitStudy}
            className="rounded-full border border-[#f0ebe3] bg-white px-4 py-2 text-sm font-medium text-[#3d3d3d]"
          >
            退出学习
          </button>
          <span className="text-sm text-[#9CA3AF]">
            {index + 1} / {cards.length}
          </span>
        </header>

        <section className="progress-track mb-6">
          <span className="progress-fill block h-full" style={{ width: `${progress}%` }} />
        </section>

        <section className="flex flex-1 items-center justify-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            disabled={index === 0}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#f0ebe3] bg-white text-[#7EB1B1] disabled:opacity-30"
            aria-label="上一张"
          >
            <IconChevronLeft />
          </button>

          <section
            className="flip-card w-full max-w-sm cursor-pointer"
            onClick={() => setFlipped(!flipped)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <section className={`flip-card-inner ${flipped ? 'flipped' : ''}`}>
              <section className="flip-card-front">
                {mode === MODES.EN_TO_ZH && current && (
                  <span className="absolute right-5 top-5">
                    <PronounceButton word={current.word} />
                  </span>
                )}
                <p className={`text-center leading-relaxed text-[#3d3d3d] ${mode === MODES.EN_TO_ZH ? 'font-serif text-3xl font-semibold' : 'text-lg'}`}>
                  {frontText}
                </p>
                {!flipped && (
                  <p className="absolute bottom-5 text-xs text-[#9CA3AF]">点击翻转 · 左右滑动切换</p>
                )}
              </section>
              <section className="flip-card-back">
                <p className={`text-center leading-relaxed text-[#3d3d3d] ${mode === MODES.ZH_TO_EN ? 'font-serif text-3xl font-semibold' : 'text-base'}`}>
                  {backText}
                </p>
              </section>
            </section>
          </section>

          <button
            type="button"
            onClick={goNext}
            disabled={index >= cards.length - 1}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#f0ebe3] bg-white text-[#7EB1B1] disabled:opacity-30"
            aria-label="下一张"
          >
            <IconChevronRight />
          </button>
        </section>

        <footer className="mt-6 flex gap-3 pb-4">
          <button
            type="button"
            onClick={goPrev}
            disabled={index === 0}
            className="btn-secondary flex-1 !w-auto disabled:opacity-40"
          >
            上一张
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={index >= cards.length - 1}
            className="btn-primary flex-1 !w-auto disabled:opacity-40"
          >
            下一张
          </button>
        </footer>
      </section>
    </section>
  )
}
