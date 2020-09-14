// Importar módulos de node
const express = require('express');
// Middleware de análisis corporal (extrae y analiza las solicitudes entrantes en json)
const bodyParser = require('body-parser');
const routes = require('./routes/routes');

// Servidor y puerto
const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));


// El servidor permite peticiones del origen localhost:63342
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:63342');
  next();
});

// Se envía como argumento el servidor express (app) al router
routes(app);

// Servidor escuchando en el puerto asignado
const server = app.listen(port, (error) => {

  if (error) {
    console.log(`Error ${error}`);
    throw error;
  }

  console.log(`Servidor escuchando en el puerto ${server.address().port}`);
});

