import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/Login/LoginPage'
import NotificationSettingsPage from './pages/NotificationSettings/NotificationSettingsPage'
import ArchivingPage from './pages/Archiving/ArchivingPage'
import ArchivingSearchResultPage from './pages/Archiving/ArchivingSearchResultPage'
import SearchPage from './pages/Search/SearchPage'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/notifications/settings" element={<NotificationSettingsPage />} />
      <Route path="/archiving" element={<ArchivingPage />} />
      <Route path="/archiving/search" element={<ArchivingSearchResultPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
