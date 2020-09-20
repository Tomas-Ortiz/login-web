// Importar módulos de node
const cors = require('cors');
const express = require('express');
// Middleware de análisis del cuerpo de las solicitudes (req.body)
const bodyParser = require('body-parser');
// Obtener información de las peticiones al servidor
const morgan = require('morgan');
const server = express();

server.use(cors());


// CONFIGURACIÓN
server.set('port', 3000);
// Dar formato más organizado al json
server.set('json spaces', 2);

// MIDDLEWARES
server.use(morgan('dev'));
// Extraer y analizar las solicitudes entrantes en json
server.use(bodyParser.json());

// Recibir y comprender los datos que vienen de un formulario HTML (req.body)
// extended true acepta cualquier tipo, no solo texto
server.use(bodyParser.urlencoded({
  extended: true,
}));

// RUTAS
server.use(require('./routes/routes'));

// INICIO DEL SERVIDOR
server.listen(server.get('port'), (error) => {

  if (error) {
    console.log(`Error ${error}`);
    throw error;
  }

  console.log(`Servidor escuchando en el puerto ${server.get('port')}`);
});

