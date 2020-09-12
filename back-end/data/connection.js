const mysql = require('mysql');

// Credenciales para la conexión a la BD
const connection = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'web_login',
};

// El pool de MySQL nos permite utilizar múltiples conexiones
// a la vez en lugar de tener que manualmente abrir y cerrar conexiones múltiples
const pool = mysql.createPool(connection);

module.exports = pool;
