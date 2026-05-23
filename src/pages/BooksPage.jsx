import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  fetchWordBooks,
  updateWordBookName,
  reorderWordBooks,
  createWordBook,
  deleteWordBook,
} from '../lib/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { IconFolder, IconMore } from '../components/Icons'

export default function BooksPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [menuId, setMenuId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchWordBooks(user.id)
      setBooks(data)
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }, [user.id])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!menuId) return
    const close = () => setMenuId(null)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [menuId])

  const moveBook = async (index, direction) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= books.length) return
    const reordered = [...books]
    const [item] = reordered.splice(index, 1)
    reordered.splice(newIndex, 0, item)
    setBooks(reordered)
    setMenuId(null)
    try {
      await reorderWordBooks(user.id, reordered.map((b) => b.id))
    } catch (e) {
      alert(e.message)
      load()
    }
  }

  const saveEdit = async (bookId) => {
    if (!editName.trim()) return
    try {
      await updateWordBookName(bookId, user.id, editName.trim())
      setEditingId(null)
      load()
    } catch (e) {
      alert(e.message)
    }
  }

  const handleCreate = async () => {
    if (!newName.trim()) return
    try {
      await createWordBook(user.id, newName.trim())
      setNewName('')
      setShowNew(false)
      load()
    } catch (e) {
      alert(e.message)
    }
  }

  const handleDelete = async (book) => {
    setMenuId(null)
    const label = book.word_count > 0
      ? `确定删除「${book.name}」及其中的 ${book.word_count} 个单词吗？此操作不可恢复。`
      : `确定删除「${book.name}」吗？`
    if (!window.confirm(label)) return
    try {
      await deleteWordBook(book.id, user.id)
      load()
    } catch (e) {
      alert(e.message)
    }
  }

  if (loading) return <div className="page-wrap"><LoadingSpinner /></div>

  return (
    <div className="page-wrap safe-top">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="page-title !mb-0">单词本</h1>
        <button
          type="button"
          onClick={() => setShowNew(true)}
          className="rounded-full bg-[#7EB1B1] px-4 py-2 text-sm font-medium text-white"
        >
          + 新建
        </button>
      </div>

      {showNew && (
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="单词本名称"
            className="input-field-plain flex-1"
            autoFocus
          />
          <button type="button" onClick={handleCreate} className="btn-primary !w-auto !px-5">创建</button>
        </div>
      )}

      {books.length === 0 ? (
        <p className="py-16 text-center text-[#9CA3AF]">暂无单词本</p>
      ) : (
        <ul className="space-y-3">
          {books.map((book, index) => (
            <li key={book.id} className="relative">
              <div
                className="folder-card"
                onClick={() => editingId !== book.id && navigate(`/book/${book.id}`)}
              >
                <div className="folder-icon">
                  <IconFolder className="h-7 w-7" />
                </div>

                <div className="min-w-0 flex-1">
                  {editingId === book.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => saveEdit(book.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(book.id)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      className="input-field-plain !py-1.5 !text-base"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <>
                      <p
                        className="truncate font-medium text-[#3d3d3d]"
                        onDoubleClick={(e) => {
                          e.stopPropagation()
                          setEditingId(book.id)
                          setEditName(book.name)
                        }}
                      >
                        {book.name}
                      </p>
                      <p className="text-xs text-[#9CA3AF]">{book.word_count} words</p>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setMenuId(menuId === book.id ? null : book.id) }}
                  className="p-1 text-[#9CA3AF]"
                >
                  <IconMore />
                </button>
              </div>

              {menuId === book.id && (
                <div
                  className="absolute right-4 top-14 z-10 min-w-[8rem] rounded-xl border border-[#f0ebe3] bg-white py-1 shadow-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => moveBook(index, -1)}
                    disabled={index === 0}
                    className="block w-full px-4 py-2 text-left text-sm disabled:opacity-30"
                  >
                    上移
                  </button>
                  <button
                    type="button"
                    onClick={() => moveBook(index, 1)}
                    disabled={index === books.length - 1}
                    className="block w-full px-4 py-2 text-left text-sm disabled:opacity-30"
                  >
                    下移
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditingId(book.id); setEditName(book.name); setMenuId(null) }}
                    className="block w-full px-4 py-2 text-left text-sm"
                  >
                    重命名
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(book)}
                    className="block w-full px-4 py-2 text-left text-sm text-[#e57373]"
                  >
                    删除单词本
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
