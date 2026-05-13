const logMensaje = (mensaje) => {
  console.log(`[${new Date().toISOString()}] ${mensaje}`);
};

const logErrorSQL = (error) => {
  console.error(`[${new Date().toISOString()}] ERROR SQL:`, error);
};

module.exports = {
  logMensaje,
  logErrorSQL
};