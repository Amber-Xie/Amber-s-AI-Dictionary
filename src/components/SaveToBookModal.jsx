import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchWordBooks, createWordBook, saveWordEntry } from '../lib/api'

export default function SaveToBookModal({ word, result, onClose, onSaved }) {
  const { user } = useAuth()
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState('')
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchWordBooks(user.id)
      .then(setBooks)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [user.id])

  const handleSave = async () => {
    setError('')
    setSaving(true)
    try {
      let bookId = selectedId
      if (newName.trim()) {
        const created = await createWordBook(user.id, newName.trim())
        bookId = created.id
      }
      if (!bookId) {
        setError('请选择单词本或输入新名称')
        setSaving(false)
        return
      }
      await saveWordEntry({
        userId: user.id,
        bookId,
        word,
        meaning: result.meaning,
        insight: result.insight,
        examples: result.examples,
      })
      onSaved?.()
      onClose()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/30 p-4 sm:items-center">
      <div className="w-full max-w-[400px] rounded-[20px] border border-[#f0ebe3] bg-white p-5">
        <h3 className="font-serif mb-4 text-xl font-semibold text-[#3d3d3d]">保存到单词本</h3>

        {loading ? (
          <p className="text-sm text-[#9CA3AF]">加载单词本...</p>
        ) : (
          <>
            <label className="section-label">选择单词本</label>
            <select
              value={selectedId}
              onChange={(e) => { setSelectedId(e.target.value); setNewName('') }}
              className="input-field-plain mb-4"
            >
              <option value="">— 请选择 —</option>
              {books.map((b) => (
                <option key={b.id} value={b.id}>{b.name} ({b.word_count} 词)</option>
              ))}
            </select>

            <p className="mb-2 text-center text-xs text-[#9CA3AF]">或创建新单词本</p>
            <input
              type="text"
              placeholder="新单词本名称"
              value={newName}
              onChange={(e) => { setNewName(e.target.value); if (e.target.value) setSelectedId('') }}
              className="input-field-plain mb-4"
            />
          </>
        )}

        {error && <p className="alert-error !py-2 !mb-3">{error}</p>}

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1 !w-auto">取消</button>
          <button type="button" onClick={handleSave} disabled={saving} className="btn-primary flex-1 !w-auto">
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  )
}
