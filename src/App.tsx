import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import LoginForm from './components/auth/LoginForm'
import ProtectedRoute from './components/auth/ProtectedRoute'
import KanbanBoard from './components/boards/KanbanBoard'
import BoardSelector from './components/boards/BoardSelector'
import PublicRequestForm from './components/requests/PublicRequestForm'
import RequestTracking from './components/requests/RequestTracking'
import RequestInbox from './components/requests/RequestInbox'

function Dashboard() {
  const { user, signOut } = useAuth()
  const [currentBoard, setCurrentBoard] = useState<'development' | 'administrative'>('development')
  const [currentTab, setCurrentTab] = useState<'boards' | 'requests'>('boards')

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
                  className={`px-4 py-2 rounded-md font-medium text-sm transition ${
                    currentTab === 'requests'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📬 Requests
                </button>
              </div>

              {/* Board Selector (solo si está en boards) */}
              {currentTab === 'boards' && (
                <BoardSelector 
                  currentBoard={currentBoard}
                  onChange={setCurrentBoard}
                />
              )}
              
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
        {currentTab === 'boards' ? (
          <>
            {/* Board Title */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {currentBoard === 'development' ? '💻 Board Development' : '📋 Board Administrative'}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Arrastra y suelta los proyectos entre las columnas
              </p>
            </div>

            {/* Kanban Board */}
            <KanbanBoard boardType={currentBoard} />
          </>
        ) : (
          <>
            {/* Requests Title */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                📬 Inbox de Solicitudes
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Revisa y gestiona las solicitudes pendientes
              </p>
            </div>

            {/* Request Inbox */}
            <RequestInbox />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App