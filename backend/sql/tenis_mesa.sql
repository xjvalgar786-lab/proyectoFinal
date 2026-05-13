-- Script SQL para crear la base de datos del proyecto Tenis de Mesa
-- Ejecutar este script en MySQL para crear la estructura inicial

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS tfgTT;
USE tfgTT;

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  password VARCHAR(255) NOT NULL,
  nacionalidad VARCHAR(100) NULL,
  puntos INT NOT NULL DEFAULT 0,
  rol ENUM('jugador', 'administrador') NOT NULL DEFAULT 'jugador',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY email (email),
  KEY idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar un usuario administrador por defecto (opcional)
-- Contraseña: admin123 (hasheada con bcrypt)
INSERT INTO users (nombre, apellido, email, password, nacionalidad, puntos, rol) VALUES
('Admin', 'Sistema', 'admin@tenisdemesa.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'España', 0, 'administrador');

-- Crear tabla de torneos (para futuras implementaciones)
CREATE TABLE IF NOT EXISTS torneos (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT NULL,
  fecha_inicio DATETIME NOT NULL,
  fecha_fin DATETIME NULL,
  max_jugadores INT NOT NULL DEFAULT 16,
  estado ENUM('abierto', 'cerrado', 'en_curso', 'finalizado') NOT NULL DEFAULT 'abierto',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla de inscripciones a torneos (para futuras implementaciones)
CREATE TABLE IF NOT EXISTS inscripciones (
  id INT NOT NULL AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  torneo_id INT NOT NULL,
  fecha_inscripcion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado ENUM('activa', 'cancelada') NOT NULL DEFAULT 'activa',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (torneo_id) REFERENCES torneos(id) ON DELETE CASCADE,
  UNIQUE KEY unique_inscripcion (usuario_id, torneo_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla de partidos (para futuras implementaciones)
CREATE TABLE IF NOT EXISTS partidos (
  id INT NOT NULL AUTO_INCREMENT,
  torneo_id INT NOT NULL,
  jugador1_id INT NOT NULL,
  jugador2_id INT NOT NULL,
  ronda INT NOT NULL,
  resultado_jugador1 INT NULL,
  resultado_jugador2 INT NULL,
  ganador_id INT NULL,
  fecha_partido DATETIME NULL,
  estado ENUM('pendiente', 'jugado', 'cancelado') NOT NULL DEFAULT 'pendiente',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (torneo_id) REFERENCES torneos(id) ON DELETE CASCADE,
  FOREIGN KEY (jugador1_id) REFERENCES users(id),
  FOREIGN KEY (jugador2_id) REFERENCES users(id),
  FOREIGN KEY (ganador_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla de noticias (para futuras implementaciones)
CREATE TABLE IF NOT EXISTS noticias (
  id INT NOT NULL AUTO_INCREMENT,
  titulo VARCHAR(300) NOT NULL,
  contenido TEXT NOT NULL,
  autor_id INT NULL,
  fecha_publicacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado ENUM('borrador', 'publicada', 'archivada') NOT NULL DEFAULT 'borrador',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (autor_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla de rankings (para futuras implementaciones)
CREATE TABLE IF NOT EXISTS rankings (
  id INT NOT NULL AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  posicion INT NOT NULL,
  puntos_totales INT NOT NULL DEFAULT 0,
  mes INT NOT NULL,
  ano INT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_ranking (usuario_id, mes, ano)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla de videos educativos
CREATE TABLE IF NOT EXISTS videos (
  id INT NOT NULL AUTO_INCREMENT,
  titulo VARCHAR(300) NOT NULL,
  descripcion TEXT NULL,
  url VARCHAR(500) NOT NULL,
  dificultad ENUM('facil', 'medio', 'dificil') NOT NULL DEFAULT 'facil',
  duracion INT NULL,
  autor_id INT NOT NULL,
  estado ENUM('borrador', 'publicado', 'archivado') NOT NULL DEFAULT 'borrador',
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (autor_id) REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_dificultad (dificultad),
  KEY idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

