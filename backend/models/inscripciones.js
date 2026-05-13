const { DataTypes } = require("sequelize");

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('inscripciones', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    torneo_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'torneos',
        key: 'id'
      }
    },
    fecha_inscripcion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    estado: {
      type: DataTypes.ENUM('activa', 'cancelada'),
      allowNull: false,
      defaultValue: 'activa'
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
    tableName: 'inscripciones',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [{ name: "id" }]
      },
      {
        name: "unique_inscripcion",
        unique: true,
        using: "BTREE",
        fields: [{ name: "usuario_id" }, { name: "torneo_id" }]
      }
    ]
  });
};