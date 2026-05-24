import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

const RECOVERY_STORAGE_KEY = 'password_recovery'

function getAppRedirectUrl() {
  return `${window.location.origin}${import.meta.env.BASE_URL}`
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recoveryMode, setRecoveryMode] = useState(
    () => sessionStorage.getItem(RECOVERY_STORAGE_KEY) === '1',
  )

  const enableRecoveryMode = useCallback(() => {
    sessionStorage.setItem(RECOVERY_STORAGE_KEY, '1')
    setRecoveryMode(true)
  }, [])

  const clearRecoveryMode = useCallback(() => {
    sessionStorage.removeItem(RECOVERY_STORAGE_KEY)
    setRecoveryMode(false)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setUser(s?.user ?? null)
      if (!s) clearRecoveryMode()
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s)
      setUser(s?.user ?? null)
      if (event === 'PASSWORD_RECOVERY') {
        enableRecoveryMode()
      }
      if (!s) clearRecoveryMode()
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [enableRecoveryMode, clearRecoveryMode])

  const signUp = useCallback(async (email, password, displayName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    })
    if (error) throw error
    return data
  }, [])

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }, [])

  const signOut = useCallback(async () => {
    clearRecoveryMode()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }, [clearRecoveryMode])

  const resetPassword = useCallback(async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getAppRedirectUrl(),
    })
    if (error) throw error
    return data
  }, [])

  const updateApiKey = useCallback(async (apiKey) => {
    const { data, error } = await supabase.auth.updateUser({
      data: { deepseek_api_key: apiKey },
    })
    if (error) throw error
    setUser(data.user)
    return data.user
  }, [])

  const value = {
    session,
    user,
    loading,
    recoveryMode,
    enableRecoveryMode,
    clearRecoveryMode,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateApiKey,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
