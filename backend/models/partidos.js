const { DataTypes } = require("sequelize");

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('partidos', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    torneo_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'torneos',
        key: 'id'
      }
    },
    jugador1_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    jugador2_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    ronda: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    resultado_jugador1: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    resultado_jugador2: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ganador_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    fecha_partido: {
      type: DataTypes.DATE,
      allowNull: true
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'jugado', 'cancelado'),
      allowNull: false,
      defaultValue: 'pendiente'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    tableName: 'partidos',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [{ name: "id" }]
      }
    ]
  });
};