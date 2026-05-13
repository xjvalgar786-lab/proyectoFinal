const { DataTypes } = require("sequelize");

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('rankings', {
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
    posicion: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    puntos_totales: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    mes: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ano: {
      type: DataTypes.INTEGER,
      allowNull: false
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
    tableName: 'rankings',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [{ name: "id" }]
      },
      {
        name: "unique_ranking",
        unique: true,
        using: "BTREE",
        fields: [{ name: "usuario_id" }, { name: "mes" }, { name: "ano" }]
      }
    ]
  });
};