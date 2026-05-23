import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getDeepSeekApiKey } from '../lib/api'

function maskKey(key) {
  if (!key || key.length < 8) return key ? '••••••••' : ''
  return key.slice(0, 4) + '••••••••' + key.slice(-4)
}

export default function SettingsPage() {
  const { user, signOut, resetPassword, updateApiKey } = useAuth()
  const savedKey = getDeepSeekApiKey(user) || ''
  const [apiKey, setApiKey] = useState('')
  const [editingKey, setEditingKey] = useState(false)
  const [resetEmail, setResetEmail] = useState(user?.email || '')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSaveKey = async () => {
    setError('')
    setMessage('')
    setLoading(true)
    try {
      await updateApiKey(apiKey.trim())
      setMessage('API Key 已更新')
      setEditingKey(false)
      setApiKey('')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    setError('')
    setMessage('')
    if (!resetEmail.trim()) {
      setError('请输入邮箱')
      return
    }
    setLoading(true)
    try {
      await resetPassword(resetEmail.trim())
      setMessage('密码重置邮件已发送')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (e) {
      alert(e.message)
    }
  }

  const displayName = user?.user_metadata?.display_name || user?.email

  return (
    <div className="page-wrap safe-top">
      <h1 className="page-title">设置</h1>

      <div className="settings-group">
        <div className="settings-row">
          <div>
            <p className="text-xs text-[#9CA3AF]">账户</p>
            <p className="font-medium text-[#3d3d3d]">{displayName}</p>
          </div>
        </div>
        <div className="settings-row">
          <p className="text-sm text-[#9CA3AF]">{user?.email}</p>
        </div>
      </div>

      <p className="section-label">AI 设置</p>
      <div className="settings-group">
        <div className="settings-row flex-col !items-stretch gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[#3d3d3d]">DeepSeek API Key</p>
              <p className="mt-0.5 text-xs text-[#9CA3AF]">
                {!editingKey && savedKey ? maskKey(savedKey) : '用于 AI 查词'}
              </p>
            </div>
            {!editingKey && (
              <button
                type="button"
                onClick={() => { setEditingKey(true); setApiKey('') }}
                className="rounded-full border border-[#7EB1B1] px-3 py-1 text-xs font-medium text-[#7EB1B1]"
              >
                更新
              </button>
            )}
          </div>
          {editingKey && (
            <>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="input-field-plain"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setEditingKey(false); setApiKey('') }}
                  className="btn-secondary flex-1 !w-auto !py-2 !text-sm"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleSaveKey}
                  disabled={loading}
                  className="btn-primary flex-1 !w-auto !py-2 !text-sm"
                >
                  保存
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <p className="section-label">账户安全</p>
      <div className="settings-group mb-4">
        <div className="settings-row flex-col !items-stretch gap-3">
          <p className="font-medium text-[#3d3d3d]">重置密码</p>
          <input
            type="email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            placeholder="注册邮箱"
            className="input-field-plain"
          />
          <button
            type="button"
            onClick={handleResetPassword}
            disabled={loading}
            className="btn-secondary !py-2.5 !text-sm"
          >
            发送重置邮件
          </button>
        </div>
      </div>

      {message && <p className="alert-success">{message}</p>}
      {error && <p className="alert-error">{error}</p>}

      <div className="settings-group">
        <div className="settings-row justify-center">
          <button type="button" onClick={handleSignOut} className="btn-danger-text">
            退出登录
          </button>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-[#9CA3AF]">
        API Key 获取：
        <a
          href="https://platform.deepseek.com"
          target="_blank"
          rel="noreferrer"
          className="text-[#7EB1B1] underline"
        >
          platform.deepseek.com
        </a>
      </p>
    </div>
  )
}
