const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');
const server = express();

const dir_raiz = 'D:/Xampp/htdocs/secure-web-login/';

// CONFIGURACIÓN
server.set('port', 3000);

// Dar formato más organizado al json
server.set('json spaces', 2);

// Ruta archivos estáticos
server.use(express.static(path.join(dir_raiz, 'front-end')));
server.set('views', dir_raiz + 'front-end/views/');
server.engine('html', require('ejs').renderFile);
server.set('view engine', 'html');

// MIDDLEWARES
server.use(morgan('dev'));
server.use(bodyParser.json());

// Recibir y comprender los datos que vienen de un formulario HTML (req.body)
// extended true acepta cualquier tipo, no solo texto
server.use(bodyParser.urlencoded({
  extended: true,
}));

// RUTAS
const {router} = require('./Controller/controller');
server.use(router);

// INICIO DEL SERVIDOR
server.listen(server.get('port'), (error) => {
  if (error) {
    console.log(`Error ${error}`);
    throw error;
  }
  console.log(`Servidor escuchando en el puerto ${server.get('port')}`);
});
