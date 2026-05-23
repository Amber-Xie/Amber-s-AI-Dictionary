import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { AuthIllustration, IconMail, IconUser, IconLock, IconEnvelopeLarge } from '../components/Icons'

const MODES = { LOGIN: 'login', REGISTER: 'register', RESET: 'reset' }

export default function AuthPage() {
  const { signIn, signUp, resetPassword } = useAuth()
  const [mode, setMode] = useState(MODES.LOGIN)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      if (mode === MODES.LOGIN) {
        await signIn(email, password)
      } else if (mode === MODES.REGISTER) {
        if (!displayName.trim()) throw new Error('请输入用户名')
        await signUp(email, password, displayName.trim())
        setMessage('注册成功！请查收邮箱验证邮件（如已开启验证）。')
      } else {
        await resetPassword(email)
        setMessage('密码重置邮件已发送，请查收邮箱。')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const isReset = mode === MODES.RESET
  const resetSent = isReset && message

  return (
    <div className="safe-top flex min-h-full flex-col justify-center bg-[#FDFCF8] px-6 py-10">
      <div className="mx-auto w-full max-w-[400px]">
        {resetSent ? (
          <div className="text-center">
            <IconEnvelopeLarge className="mx-auto mb-6" />
            <h1 className="font-serif mb-2 text-2xl font-semibold text-[#3d3d3d]">邮件已发送</h1>
            <p className="mb-8 text-sm text-[#9CA3AF]">{message}</p>
            <button
              type="button"
              onClick={() => { setMode(MODES.LOGIN); setMessage('') }}
              className="btn-primary"
            >
              返回登录
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <AuthIllustration />
              <h1 className="font-serif mt-4 text-2xl font-semibold text-[#3d3d3d]">
                Welcome to Vocabulary
              </h1>
              <p className="mt-1 text-sm text-[#9CA3AF]">开启你的英语学习之旅</p>
            </div>

            {mode !== MODES.RESET && (
              <div className="segmented mb-6">
                <button
                  type="button"
                  className={`segmented-btn ${mode === MODES.LOGIN ? 'active' : ''}`}
                  onClick={() => { setMode(MODES.LOGIN); setError(''); setMessage('') }}
                >
                  登录
                </button>
                <button
                  type="button"
                  className={`segmented-btn ${mode === MODES.REGISTER ? 'active' : ''}`}
                  onClick={() => { setMode(MODES.REGISTER); setError(''); setMessage('') }}
                >
                  注册
                </button>
              </div>
            )}

            {isReset && (
              <div className="mb-6 text-center">
                <h2 className="font-serif text-xl font-semibold text-[#3d3d3d]">重置密码</h2>
                <p className="mt-1 text-sm text-[#9CA3AF]">输入注册邮箱接收重置链接</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === MODES.REGISTER && (
                <div className="input-wrap">
                  <span className="input-icon"><IconUser /></span>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="用户名"
                    className="input-field"
                  />
                </div>
              )}

              <div className="input-wrap">
                <span className="input-icon"><IconMail /></span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="邮箱地址"
                  className="input-field"
                />
              </div>

              {mode !== MODES.RESET && (
                <div className="input-wrap">
                  <span className="input-icon"><IconLock /></span>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="密码"
                    className="input-field"
                  />
                </div>
              )}

              {error && <p className="alert-error !mb-0">{error}</p>}
              {message && mode !== MODES.RESET && <p className="alert-success !mb-0">{message}</p>}

              <button type="submit" disabled={loading} className="btn-primary !mt-2">
                {loading
                  ? '处理中...'
                  : mode === MODES.LOGIN
                    ? '登录'
                    : mode === MODES.REGISTER
                      ? '注册'
                      : '发送重置邮件'}
              </button>
            </form>

            <div className="mt-5 text-center">
              {mode === MODES.LOGIN && (
                <button
                  type="button"
                  onClick={() => { setMode(MODES.RESET); setError(''); setMessage('') }}
                  className="btn-ghost"
                >
                  忘记密码？
                </button>
              )}
              {mode === MODES.RESET && (
                <button
                  type="button"
                  onClick={() => { setMode(MODES.LOGIN); setError(''); setMessage('') }}
                  className="btn-ghost"
                >
                  返回登录
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
