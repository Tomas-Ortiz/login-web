const pool = require('../Data/connection');
const bcrypt = require('bcrypt');
const queries = require('../Data/queries');

var resultado = {
  mensaje: "",
  estado: "error"
};

async function confirmAccount(req) {
  let url = {
    token: req.query.token,
    mail: req.query.mail
  };
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  try {
    //Check that the emails exist first
    const resultEmailToken = await queries.selectEmailWhereToken(url.token);

    if (resultEmailToken[0].length > 0) {

      let decryptedMail = resultEmailToken[0][0].email;

      //Compare decryptedMail from DATABASE, with encrypted mail from URL
      let isMatch = await bcrypt.compare(decryptedMail, url.mail);

      if (isMatch) {
        //The email exists, now set Confirmado = 1
        await queries.updateConfirmado(1, decryptedMail);
        resultado.mensaje = "El usuario " + decryptedMail + " ha confirmado su cuenta satisfactoriamente.";
        resultado.estado = "ok";
      }
    } else {
      resultado.mensaje = "No existe un usuario con ese email.";
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

exports.confirmAccount = confirmAccount;
