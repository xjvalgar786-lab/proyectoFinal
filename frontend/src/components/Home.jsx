import React from 'react'
import logo from '../img/logo.png'
function Home() {
  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-12 text-center">
          <h1 className="display-4 text-danger">Bienvenido a Tenis de Mesa Torneos</h1>
          <p className="lead">Gestiona torneos, registra jugadores y mantén el ranking actualizado.</p>
          <img src={logo} alt="Tenis de Mesa" className="img-fluid mt-4" style={{height: '400px', alignItems: 'center'  }}/>
        </div>
      </div>
    </div>
  )
}

export default Home