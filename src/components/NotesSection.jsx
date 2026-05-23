import { useState } from 'react'
import { updateWordEntryNotes } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function NotesSection({ entry, onUpdate }) {
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(entry.notes || '')
  const [saving, setSaving] = useState(false)

  const hasNotes = Boolean(entry.notes?.trim())

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await updateWordEntryNotes(entry.id, user.id, draft.trim())
      onUpdate(updated)
      setEditing(false)
    } catch (e) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setDraft(entry.notes || '')
    setEditing(false)
  }

  return (
    <article className="card mt-3">
      <div className="mb-3 flex items-center justify-between">
        <p className="section-label !mb-0">我的笔记</p>
        {!editing && (
          <button type="button" onClick={() => { setDraft(entry.notes || ''); setEditing(true) }} className="btn-ghost text-xs">
            {hasNotes ? '编辑' : '添加'}
          </button>
        )}
      </div>

      {editing ? (
        <>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            placeholder="写下记忆技巧、联想、用法心得..."
            className="input-field-plain !p-3 resize-none"
          />
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={handleCancel} className="btn-secondary flex-1 !py-2.5 !text-sm">
              取消
            </button>
            <button type="button" onClick={handleSave} disabled={saving} className="btn-primary flex-1 !py-2.5 !text-sm !w-auto">
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </>
      ) : hasNotes ? (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#5a5a5a]">{entry.notes}</p>
      ) : (
        <p className="text-sm text-[#9CA3AF]">暂无笔记</p>
      )}
    </article>
  )
}
