import React, { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

const API_URL = 'https://mysql-production-afe3.up.railway.app'

function Profile() {
  const { user } = useContext(AuthContext)

  console.log('Profile component: Starting render')
  console.log('User from context:', user)

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card text-white bg-dark border-secondary shadow">
            <div className="card-body text-center">
              <h3 className="card-title mb-3">Perfil - Test</h3>
              <p className="mb-3">Si ves este mensaje, la ruta funciona correctamente.</p>
              <div className="alert alert-info">
                <strong>Usuario actual:</strong>
                <pre className="mt-2 text-start">{JSON.stringify(user, null, 2)}</pre>
              </div>
              {user ? (
                <div className="mt-3">
                  <p className="text-success">✅ Usuario autenticado</p>
                  <p>Nombre: {user.nombre} {user.apellido}</p>
                  <p>Email: {user.email}</p>
                </div>
              ) : (
                <div className="mt-3">
                  <p className="text-warning">⚠️ No hay usuario autenticado</p>
                  <a href="/auth" className="btn btn-primary">Ir a Login</a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile