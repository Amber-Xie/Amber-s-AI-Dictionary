import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { lookupWord } from '../lib/deepseek'
import { getDeepSeekApiKey } from '../lib/api'
import WordResultCard from '../components/WordResultCard'
import SaveToBookModal from '../components/SaveToBookModal'
import LoadingSpinner from '../components/LoadingSpinner'

export default function FindPage() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [searchedWord, setSearchedWord] = useState('')
  const [error, setError] = useState('')
  const [showSave, setShowSave] = useState(false)

  const handleSearch = async (e) => {
    e?.preventDefault()
    const word = query.trim()
    if (!word) return

    setError('')
    setLoading(true)
    setResult(null)

    try {
      const apiKey = getDeepSeekApiKey(user)
      const data = await lookupWord(apiKey, word)
      setResult(data)
      setSearchedWord(word)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-wrap safe-top">
      <h1 className="page-title">查找</h1>

      <form onSubmit={handleSearch} className="search-combo mb-5">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="输入英文单词..."
          autoCapitalize="off"
          autoCorrect="off"
        />
        <button type="submit" disabled={loading}>
          {loading ? '...' : 'Find'}
        </button>
      </form>

      {error && <div className="alert-error">{error}</div>}

      {loading && <LoadingSpinner text="AI 正在分析单词..." />}

      {result && (
        <>
          <WordResultCard word={searchedWord} result={result} />

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setShowSave(true)}
              className="btn-primary flex-1"
            >
              保存到单词本
            </button>
          </div>
        </>
      )}

      {showSave && result && (
        <SaveToBookModal
          word={searchedWord}
          result={result}
          onClose={() => setShowSave(false)}
        />
      )}
    </div>
  )
}
