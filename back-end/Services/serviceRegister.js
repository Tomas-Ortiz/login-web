const pool = require('../Data/connection');
const bcrypt = require('bcrypt');
const serviceEmail = require('./serviceEmail');
const queries = require('../Data/queries');
const crypto = require('crypto');

// saltRounds define el costo de procesado de los datos
// Cuanto más alto es el número, más tiempo se requiere para calcular el hash asociado a la password
const BCRYPT_SALT_ROUNDS = 12;

var resultado = {
  mensaje: "",
  estado: "error"
};

async function userRegister(req) {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // Antes de insertar al usuario, se debe verificar si no existe ya el email ingresado
    const resultsEmails = await queries.selectEmailWhereEmail(req.body.email);

    if (resultsEmails[0].length > 0) {
      resultado.mensaje = "No se pudo registrar al usuario porque el email ingresado ya existe.";
      resultado.estado = "error";
    } else {
      let token = crypto.randomBytes(40).toString('hex');

      const user = {
        nombreCompleto: req.body.nombreCompleto,
        email: req.body.email,
        contraseña: req.body.contrasenia,
        activo: 1,
        fechaCreado: req.body.fechaCreado,
        token: token
      };

      const hashedPassword = await bcrypt.hash(user.contraseña, BCRYPT_SALT_ROUNDS);

      user.contraseña = hashedPassword;

      const resultInsertUser = await queries.insertUser(user);

      resultado.mensaje = `Usuario ${user.nombreCompleto} con id ${resultInsertUser[0].insertId} registrado exitosamente.`;
      resultado.estado = "ok";

      const hashedEmail = await bcrypt.hash(user.email, BCRYPT_SALT_ROUNDS);
      serviceEmail.sendMailToUser(user.email, hashedEmail, user.token);
    }
    await connection.commit();
  } catch (err) {
    resultado.mensaje = "Error: " + err;
    resultado.estado = "error";
    if (connection) {
      await connection.rollback();
    }
  } finally {
    if (connection) {
      await connection.release();
      console.log(resultado);
      return resultado;
    }
  }
}

exports.userRegister = userRegister;
