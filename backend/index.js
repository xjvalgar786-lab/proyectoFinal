// Importar librería express --> web server
const express = require("express");
// Importar librería path, para manejar rutas de ficheros en el servidor
const path = require("path");
const fs = require("fs");
// Importar libreria CORS
const cors = require("cors");
// Importar cookie-parser para manejar cookies
const cookieParser = require("cookie-parser");
// Importar configuración de Sequelize
const sequelize = require("./config/sequelize");
// Importar gestores de rutas
const authRoutes = require("./routes/authRoutes");
const torneosRoutes = require("./routes/torneosRoutes");
const torneosPublicosRoutes = require("./routes/torneosPublicosRoutes");
const inscripcionesRoutes = require("./routes/inscripcionesRoutes");
const partidosRoutes = require("./routes/partidosRoutes");
const noticiasRoutes = require("./routes/noticiasRoutes");
const noticiasPublicasRoutes = require("./routes/noticiasPublicasRoutes");
const rankingsRoutes = require("./routes/rankingsRoutes");
const videosRoutes = require("./routes/videosRoutes");
const videosPublicasRoutes = require("./routes/videosPublicasRoutes");
const componenteRoutes = require("./routes/componenteRoutes");
const tipoRoutes = require("./routes/tipoRoutes");

const app = express();
const port = process.env.PORT || 5000;

// Configurar middleware para analizar JSON en las solicitudes
app.use(express.json());
// Configurar CORS para admitir cualquier origen
app.use(cors());
// Configurar cookie-parser
app.use(cookieParser());

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Base de datos conectada");
  } catch (error) {
    console.error("Error DB:", error);
  }
})();



// Configurar rutas de la API Rest
app.use("/api/auth", authRoutes);
app.use("/api/torneos", torneosRoutes);
app.use("/api/torneos-publicos", torneosPublicosRoutes);
app.use("/api/inscripciones", inscripcionesRoutes);
app.use("/api/partidos", partidosRoutes);
app.use("/api/noticias", noticiasRoutes);
app.use("/api/noticias-publicas", noticiasPublicasRoutes);
app.use("/api/rankings", rankingsRoutes);
app.use("/api/videos", videosRoutes);
app.use("/api/videos-publicas", videosPublicasRoutes);
app.use("/api/componentes", componenteRoutes);
app.use("/api/tipos", tipoRoutes);

app.get("/", (req, res) => {
  res.send({
    status: "ok",
    dbHost: process.env.DB_HOST || process.env.MYSQLHOST,
  });
});

// Configurar el middleware para servir archivos estáticos desde el directorio 'public\old_js_vainilla'
const publicPath = path.join(__dirname, "public", "old_js_vainilla");
app.use(express.static(publicPath));

// Middleware catch-all para SPA (Single Page Application) - debe ir al final
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) return next();

  const indexFile = path.join(publicPath, "index.html");
  if (fs.existsSync(indexFile)) {
    return res.sendFile(indexFile);
  }

  res.status(404).send({ error: "Archivo estático no encontrado" });
});


// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
