import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import LoginForm from './components/auth/LoginForm'
import ProtectedRoute from './components/auth/ProtectedRoute'
import KanbanBoard from './components/boards/KanbanBoard'
import BoardSelector from './components/boards/BoardSelector'
import DashboardView from './components/dashboard/DashboardView'
import PublicRequestForm from './components/requests/PublicRequestForm'
import RequestTracking from './components/requests/RequestTracking'
import PublicLanding from './components/requests/PublicLanding'
import RequestInbox from './components/requests/RequestInbox'
import UserManagementPanel from './components/admin/UserManagementPanel'
import WorkloadView from './components/admin/WorkloadView'

import PapeleraView from './components/admin/PapeleraView'
import NotificationBell from './components/notifications/NotificationBell'
import { usePendingCount } from './hooks/usePendingCount'
import { useSlaWarnings } from './hooks/useSlaWarnings'

function AdminClock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const tick = () => setTime(
      new Date().toLocaleTimeString('es-PE', { timeZone: 'America/Lima', hour12: false })
    )
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="text-right hidden sm:block">
      <p className="text-sm font-mono font-semibold text-gray-800">{time}</p>
      <p className="text-xs text-gray-400 whitespace-nowrap">Lima GMT-5</p>
    </div>
  )
}

function Dashboard() {
  const { user, signOut } = useAuth()
  const [currentBoard, setCurrentBoard] = useState<'development' | 'administrative'>('development')
  const [currentTab, setCurrentTab]   = useState<'dashboard' | 'boards' | 'requests' | 'equipo'>('dashboard')
  const [adminSubTab, setAdminSubTab] = useState<'usuarios' | 'carga' | 'papelera'>('carga')
  const [openProjectId, setOpenProjectId] = useState<string | null>(null)
  const pendingCount = usePendingCount(user?.role === 'admin')
  useSlaWarnings()

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
              🎯 Ticketera Controlling
            </h1>
            
            <div className="flex items-center gap-6">
              {/* Tab Selector */}
              <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setCurrentTab('dashboard')}
                  className={`px-4 py-2 rounded-md font-medium text-sm transition ${
                    currentTab === 'dashboard'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📈 Dashboard
                </button>
                <button
                  onClick={() => setCurrentTab('boards')}
                  className={`px-4 py-2 rounded-md font-medium text-sm transition ${
                    currentTab === 'boards'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📊 Boards
                </button>
                <button
                  onClick={() => setCurrentTab('requests')}
                  className={`px-4 py-2 rounded-md font-medium text-sm transition flex items-center gap-1.5 ${
                    currentTab === 'requests'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📬 Requests
                  {pendingCount > 0 && (
                    <span className="min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                      {pendingCount > 9 ? '9+' : pendingCount}
                    </span>
                  )}
                </button>
                {user?.role === 'admin' && (
                  <button
                    onClick={() => setCurrentTab('equipo')}
                    className={`px-4 py-2 rounded-md font-medium text-sm transition ${
                      currentTab === 'equipo'
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    👥 Equipo
                  </button>
                )}
              </div>

              {/* Board Selector (solo si está en boards) */}
              {currentTab === 'boards' && (
                <BoardSelector 
                  currentBoard={currentBoard}
                  onChange={setCurrentBoard}
                />
              )}
              
              {/* Reloj + Campana */}
              <div className="flex items-center gap-2">
                {user?.role === 'admin' && <AdminClock />}
                <NotificationBell onProjectClick={(projectId) => {
                  setCurrentTab('boards')
                  setOpenProjectId(projectId)
                }} />
              </div>

              {/* User Info */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-medium text-gray-900">{user?.full_name}</p>
                  <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
                </div>
                <button
                  onClick={signOut}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {currentTab === 'dashboard' && <DashboardView />}

        {currentTab === 'boards' && (
          <KanbanBoard
            boardType={currentBoard}
            openProjectId={openProjectId}
            onOpenHandled={() => setOpenProjectId(null)}
          />
        )}

        {currentTab === 'requests' && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                📬 Inbox de Solicitudes
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Revisa y gestiona las solicitudes pendientes
              </p>
            </div>
            <RequestInbox />
          </>
        )}

        {currentTab === 'equipo' && user?.role === 'admin' && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">👥 Equipo</h2>
              <p className="text-gray-600 text-sm mt-1">
                Gestión de usuarios y carga de trabajo del equipo
              </p>
            </div>

            {/* Sub-tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-6">
              <button
                onClick={() => setAdminSubTab('carga')}
                className={`px-4 py-2 rounded-md font-medium text-sm transition ${
                  adminSubTab === 'carga'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📊 Carga de Trabajo
              </button>
              <button
                onClick={() => setAdminSubTab('usuarios')}
                className={`px-4 py-2 rounded-md font-medium text-sm transition ${
                  adminSubTab === 'usuarios'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🔑 Usuarios
              </button>

              <button
                onClick={() => setAdminSubTab('papelera')}
                className={`px-4 py-2 rounded-md font-medium text-sm transition ${
                  adminSubTab === 'papelera'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🗑 Papelera
              </button>
            </div>

            {adminSubTab === 'carga'    && <WorkloadView />}
            {adminSubTab === 'usuarios' && <UserManagementPanel />}

            {adminSubTab === 'papelera' && <PapeleraView />}
          </>
        )}
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/portal" element={<PublicLanding />} />
        <Route path="/request" element={<PublicRequestForm />} />
        <Route path="/tracking" element={<RequestTracking />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/portal" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App