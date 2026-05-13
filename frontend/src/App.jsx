import React, { useContext } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from './components/Home'
import Tournaments from './components/Tournaments'
import Ranking from './components/Ranking'
import News from './components/News'
import Education from './components/Education'
import Auth from './components/Auth'
import Profile from './components/Profile'
import Bracket from './components/Bracket'
import logo from './img/logo.png'
import { AuthContext, AuthProvider } from './context/AuthContext'

function AppContent() {
  const { user, logout } = useContext(AuthContext)

  return (
    <div className="App" style={{ backgroundColor: 'black', color: 'white' }}>
      <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: '#111' }}>
        <div className="container">
          <Link className="navbar-brand" to="/"><img src={logo} alt="Logo" style={{ height: '60px' }} /></Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/">Inicio</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/torneos">Torneos</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/ranking">Ranking</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/noticias">Noticias</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/educacion">Educación</Link>
              </li>
              {user ? (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/perfil">Perfil</Link>
                  </li>
                  <li className="nav-item d-flex align-items-center">
                    <span className="nav-link text-white d-flex align-items-center" style={{ padding: '0.3rem 0.6rem', cursor: 'default' }}>
                      Hola, <strong className="ms-1">{user.nombre}</strong>
                    </span>
                    <button
                      className="btn btn-sm btn-outline-light ms-2"
                      onClick={logout}
                      style={{ transition: 'all .2s', borderColor: 'rgba(255,255,255,0.4)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = '#111' }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = ''; }}
                    >
                      Cerrar sesión
                    </button>
                  </li>
                </>
              ) : (
                <li className="nav-item">
                  <Link className="nav-link" to="/auth">Iniciar sesión</Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/torneos" element={<Tournaments />} />
        <Route path="/torneos/:id/bracket" element={<Bracket />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/noticias" element={<News />} />
        <Route path="/educacion" element={<Education />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/perfil" element={<Profile />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App