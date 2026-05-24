import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'
import AuthPage from './pages/AuthPage'
import FindPage from './pages/FindPage'
import BooksPage from './pages/BooksPage'
import BookDetailPage from './pages/BookDetailPage'
import WordDetailPage from './pages/WordDetailPage'
import StudyPage from './pages/StudyPage'
import SettingsPage from './pages/SettingsPage'
import RecoveryPasswordGate from './components/RecoveryPasswordGate'

function ProtectedRoutes() {
  const { session, loading, recoveryMode } = useAuth()

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#FDFCF8]">
        <LoadingSpinner />
      </div>
    )
  }

  if (recoveryMode) {
    return null
  }

  if (!session) {
    return <AuthPage />
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/find" replace />} />
        <Route path="find" element={<FindPage />} />
        <Route path="books" element={<BooksPage />} />
        <Route path="book/:bookId" element={<BookDetailPage />} />
        <Route path="word/:wordId" element={<WordDetailPage />} />
        <Route path="study" element={<StudyPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/find" replace />} />
    </Routes>
  )
}

export default function App() {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined

  return (
    <BrowserRouter basename={basename}>
      <AuthProvider>
        <RecoveryPasswordGate />
        <div className="h-full bg-[#FDFCF8]">
          <ProtectedRoutes />
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}
