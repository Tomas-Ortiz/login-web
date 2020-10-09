const nodemailer = require("nodemailer");
const credentials = require('./credentials');

let Mailer = (function() {

    return {
        // send mail with defined transport object
        sendMailToUser: function(mail, token) {

            let userMail = mail;
            let mailBody = getMailBody(userMail, token);

            let resultado = {
                mensaje: "Message is being sent to USER: "+userMail + "\nwith token: "+token,
                estado: "sending"
            };

            console.log("-----------------------------------------");
            console.log("SERVER credentials: ");
            console.log("User: %s", credentials.getUser());
            console.log("Password: %s", credentials.getPassword());
            console.log("---------------------");
            console.log("USER credentials: ");
            console.log("User: %s", userMail);
            console.log("Token: %s", token);
            console.log("-----------------------------------------");
            console.log('Credentials obtained, sending message...');

            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: credentials.getUser(),
                    pass: credentials.getPassword()
                }
            });

            let message = {
                from: "SecureSite<no-reply@securesite.com>",
                to: userMail,
                subject: "Confirmar Registro",
                text: "",
                html: mailBody
            };

            transporter.sendMail(message, (err, info) => {
                if(err){
                    resultado.mensaje = "ERROR: Couldn't send mail";
                } else {
                    //console.log(info);
                    //console.log('Message sent: %s', info.messageId);
                    //console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                    resultado.mensaje = "Mail Sent Correctly";
                    resultado.estado = "ok";
                }
            });

            console.log(resultado);
            return resultado;
        }
    }

});

function getMailBody(userMail, token){
    let url = `http://localhost:3000/reset?token=${token}&mail=${userMail}`;
    return  `<h1>Secure Site<h1/>` +
            `<p>Recibiste este correo porque vos (o alguien más) solicitó crear una cuenta en nuestro sitio ` +
            `web. Haz click en el siguiente link, o copialo en el navegador para compeltar el proceso de ` +
            `registro:</p><br><br>` +
            `<p><i>Ten en cuenta que deberás confirmar tu registro en un plazo de 24 horas.</i></p><br><br>` +
            `<b><a href='${url}'>Confirmar Registro</a></b><br><br>` +
            `<p><i>Si no intentaste registrarte en nuestra página, por favor ignora este correo.</i></p>`
}

module.exports = Mailer();