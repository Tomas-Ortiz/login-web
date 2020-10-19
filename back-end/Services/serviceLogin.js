const pool = require('../Data/connection');
const queries = require('../Data/queries');
const bcrypt = require('bcrypt');
const serviceToken = require('./serviceToken');
var resultado = {
  mensaje: "",
  estado: "error"
};

async function login(req) {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  const data = {
    mail: req.body.email,
    password: req.body.contrasenia,
    hashedPassword: '',
    loginDate: req.body.fechaLogin,
    loginTime: req.body.horaLogin
  };

  try {
    //Search database for the corresponding email and select both hashed password and email
    const resultsEmails = await queries.selectAllWhereEmail(data.mail);

    if (resultsEmails[0].length > 0) {
      const userResult = resultsEmails[0][0];

      data.hashedPassword = userResult.contraseña;

      const isMatch = await bcrypt.compare(data.password, data.hashedPassword);

      if (isMatch) {
        if (userResult.activo === 0) {
          resultado.mensaje = "No puedes iniciar sesión debido a que la cuenta se encuentra bloqueada.";
          resultado.estado = "error";
        } else {
          await queries.insertDates(userResult.id, data.loginDate, data.loginTime);

          let userData = {
            id: userResult.id,
            nombreCompleto: userResult.nombreCompleto,
            email: userResult.email,
            confirmado: userResult.confirmado,
            activo: userResult.activo,
            rol: userResult.rol,
            fechaCreado: userResult.fechaCreado
          };

          // Se genera el token al usuario con sus datos y se guarda en el localStorage
          serviceToken.generarToken(userData);

          resultado.mensaje = "Usuario " + data.mail + " ha iniciado sesión correctamente.";
          resultado.estado = "ok";
        }
      } else {
        resultado.mensaje = "Correo electrónico o contraseña incorrectos.";
        resultado.estado = "error";
      }
    } else {
      resultado.mensaje = "El correo electrónico ingresado no está registrado.";
      resultado.estado = "error";
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

exports.login = login;
