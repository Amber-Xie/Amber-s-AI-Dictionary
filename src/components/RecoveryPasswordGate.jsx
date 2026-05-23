import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { IconLock, IconLockLarge } from './Icons'
import LoadingSpinner from './LoadingSpinner'

function urlHasRecoveryType() {
  const searchParams = new URLSearchParams(window.location.search)
  if (searchParams.get('type') === 'recovery') return true

  const hash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash
  if (!hash) return false

  return new URLSearchParams(hash).get('type') === 'recovery'
}

export default function RecoveryPasswordGate() {
  const location = useLocation()
  const [active, setActive] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sessionReady, setSessionReady] = useState(false)

  const syncRecoveryState = useCallback(() => {
    setActive(urlHasRecoveryType())
  }, [])

  useEffect(() => {
    syncRecoveryState()
    window.addEventListener('hashchange', syncRecoveryState)
    window.addEventListener('popstate', syncRecoveryState)
    return () => {
      window.removeEventListener('hashchange', syncRecoveryState)
      window.removeEventListener('popstate', syncRecoveryState)
    }
  }, [syncRecoveryState, location.pathname, location.search, location.hash])

  useEffect(() => {
    if (!active) {
      setSessionReady(false)
      return
    }

    let cancelled = false

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!cancelled) setSessionReady(!!session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) setSessionReady(!!session)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [active])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('密码至少 6 位')
      return
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError

      const homeUrl = `${window.location.origin}${import.meta.env.BASE_URL}#/find`
      window.location.href = homeUrl
    } catch (err) {
      setError(err.message || '密码更新失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  if (!active) return null

  return (
    <section className="fixed inset-0 z-[100] flex items-center justify-center bg-[#FDFCF8] px-6">
      <section className="w-full max-w-[400px]">
        <header className="mb-6 text-center">
          <IconLockLarge className="mx-auto mb-4" />
          <h1 className="font-serif text-2xl font-semibold text-[#3d3d3d]">设置新密码</h1>
          <p className="mt-2 text-sm text-[#9CA3AF]">
            请设置您的新密码以完成重置
          </p>
        </header>

        {!sessionReady ? (
          <p className="flex justify-center py-8">
            <LoadingSpinner />
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="input-wrap block">
              <span className="input-icon"><IconLock /></span>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="新密码"
                className="input-field"
                autoComplete="new-password"
              />
            </label>

            <label className="input-wrap block">
              <span className="input-icon"><IconLock /></span>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="确认新密码"
                className="input-field"
                autoComplete="new-password"
              />
            </label>

            {error && <p className="alert-error !mb-0">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary !mt-2">
              {loading ? '保存中...' : '确认并进入应用'}
            </button>
          </form>
        )}
      </section>
    </section>
  )
}
