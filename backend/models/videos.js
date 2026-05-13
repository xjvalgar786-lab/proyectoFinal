const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const videos = sequelize.define('videos', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dificultad: {
      type: DataTypes.ENUM('facil', 'medio', 'dificil'),
      allowNull: false,
      defaultValue: 'facil'
    },
    duracion: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Duración en segundos'
    },
    autor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    estado: {
      type: DataTypes.ENUM('borrador', 'publicado', 'archivado'),
      allowNull: false,
      defaultValue: 'publicado'
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'videos',
    timestamps: true
  });

  return videos;
};
