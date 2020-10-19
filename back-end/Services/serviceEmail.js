const nodemailer = require("nodemailer");
const accountCredentials = require('../Data/credentials');

let Mailer = (function () {
  return {
    // send mail with defined transport object
    sendMailToUser: function (decryptedMail, hashedMail, token) {

      let mailBody = getMailBody(hashedMail, token);

      let resultado = {
        mensaje: "El correo está siendo enviado al usuario: " + decryptedMail + " con el token: " + token,
        estado: "sending"
      };

      console.log("-----------------------------------------");
      console.log("Credenciales del usuario: ");
      console.log("email: %s", decryptedMail);
      console.log("token: %s", token);
      console.log("-----------------------------------------");

      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: accountCredentials.getUser(),
          pass: accountCredentials.getPassword()
        }
      });

      let message = {
        from: "SecureSite<no-reply@securesite.com>",
        to: decryptedMail,
        subject: "Confirmar Registro",
        text: "",
        html: mailBody
      };

      transporter.sendMail(message, (err, info) => {
        if (err) {
          resultado.mensaje = "ERROR: no se pudo enviar el mail.";
          resultado.estado = "error";
        } else {
          resultado.mensaje = "Mail enviado correctamente.";
          resultado.estado = "ok";
        }
      });
      console.log(resultado);
      return resultado;
    }
  }
});

// MENSAJE DEL EMAIL
function getMailBody(hashedMail, token) {
  let url = `http://localhost:3000/confirm?token=${token}&mail=${hashedMail}`;
  return `<h1>Secure Site<h1/>` +
    `<p>Recibiste este correo porque vos (o alguien más) solicitó crear una cuenta en nuestro sitio ` +
    `web. Haz click en el siguiente link, o copialo en el navegador para compeltar el proceso de ` +
    `registro:</p><br><br>` +
    `<p><i>Ten en cuenta que deberás confirmar tu registro en un plazo de 24 horas.</i></p><br><br>` +
    `<b><a href='${url}'>Confirmar Registro</a></b><br><br>` +
    `<p><i>Si no intentaste registrarte en nuestra página, por favor ignora este correo.</i></p>`
}

module.exports = Mailer();
