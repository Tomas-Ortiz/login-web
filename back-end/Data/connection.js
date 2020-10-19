const mysql = require('mysql2');

const connection = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'web_login',
};

// El pool de MySQL permite utilizar múltiples conexiones simultáneas
// sin tener que abrir y cerrar conexiones manualmente
const pool = mysql.createPool(connection);

pool.getConnection(function (err, conex) {
  if (err) {
    console.log("Error en la conexión a la base de datos");
    throw err.sqlMessage;
  }
  console.log("Conectado a la base de datos");
});

promisePool = pool.promise();

module.exports = promisePool;
