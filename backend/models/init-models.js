const DataTypes = require("sequelize").DataTypes;
const _users = require("./users");
const _torneos = require("./torneos");
const _inscripciones = require("./inscripciones");
const _partidos = require("./partidos");
const _noticias = require("./noticias");
const _rankings = require("./rankings");
const _videos = require("./videos");

function initModels(sequelize) {
  const users = _users(sequelize, DataTypes);
  const torneos = _torneos(sequelize, DataTypes);
  const inscripciones = _inscripciones(sequelize, DataTypes);
  const partidos = _partidos(sequelize, DataTypes);
  const noticias = _noticias(sequelize, DataTypes);
  const rankings = _rankings(sequelize, DataTypes);
  const videos = _videos(sequelize);

  // Asociaciones
  users.hasMany(inscripciones, { foreignKey: 'usuario_id', onDelete: 'CASCADE' });
  inscripciones.belongsTo(users, { foreignKey: 'usuario_id', as: 'usuario' });

  torneos.hasMany(inscripciones, { foreignKey: 'torneo_id', onDelete: 'CASCADE' });
  inscripciones.belongsTo(torneos, { foreignKey: 'torneo_id' });

  torneos.hasMany(partidos, { foreignKey: 'torneo_id', onDelete: 'CASCADE' });
  partidos.belongsTo(torneos, { foreignKey: 'torneo_id' });

  users.hasMany(partidos, { as: 'PartidosJugador1', foreignKey: 'jugador1_id' });
  partidos.belongsTo(users, { as: 'jugador1', foreignKey: 'jugador1_id' });

  users.hasMany(partidos, { as: 'PartidosJugador2', foreignKey: 'jugador2_id' });
  partidos.belongsTo(users, { as: 'jugador2', foreignKey: 'jugador2_id' });

  users.hasMany(partidos, { as: 'PartidosGanados', foreignKey: 'ganador_id' });
  partidos.belongsTo(users, { as: 'ganador', foreignKey: 'ganador_id' });

  users.hasMany(noticias, { foreignKey: 'autor_id' });
  noticias.belongsTo(users, { foreignKey: 'autor_id' });

  users.hasMany(rankings, { foreignKey: 'usuario_id', onDelete: 'CASCADE' });
  rankings.belongsTo(users, { foreignKey: 'usuario_id' });

  users.hasMany(videos, { foreignKey: 'autor_id', onDelete: 'CASCADE' });
  videos.belongsTo(users, { as: 'autor', foreignKey: 'autor_id' });

  return {
    users,
    torneos,
    inscripciones,
    partidos,
    noticias,
    rankings,
    videos
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;