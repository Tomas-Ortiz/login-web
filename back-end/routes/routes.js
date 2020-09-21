// Router es una clase de express
const {Router} = require('express');
const router = Router();
const pool = require('../data/connection');

//Función hash para encriptar contraseñas
const bcrypt = require('bcrypt');

// saltRounds define el costo de procesado de los datos
// Cuanto más alto es el número, más tiempo se requiere para calcular el hash asociado a la password
const BCRYPT_SALT_ROUNDS = 12;

// El servidor permite peticiones del origen localhost:63342
/*
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});*/

// INICIAR SESIÓN USUARIO
router.post('/api/login', (req, res) => {
  let mensaje = '', estado = '', resultado = '', query;

  const data = {
    mail: req.body.email,
    password: req.body.contrasenia,
    hashedPassword: '',
    loginDate: req.body.fechaLogin
  };

  //Search database for the corresponding email and select both hashed password and email
  query = 'SELECT email,contraseña FROM users WHERE email = ?';
  pool.query(query, data.mail, (error, result) => {

    let normalObj = Object.assign({}, result[0]);
    data.hashedPassword = normalObj.contraseña;

    if (result.length > 0) {
      resultado = {
        mensaje: "User is trying to log in",
        estado: "ok"
      };

      bcrypt.compare(data.password, data.hashedPassword, (error, result) => {

          if (error) {
              mensaje = "An error has ocurred trying to encrypt your password";

              resultado = {
                  mensaje: mensaje,
                  estado: "error"
              };

              console.log(mensaje);
              res.send(resultado);
          }
          else if(result){

              console.log("User " + data.mail + " has logged in (" + data.loginDate + ")");

              query = 'UPDATE users SET fechaLogin = ? WHERE email = ?';
              pool.query(query, [data.loginDate, data.mail], (error, result) => {

                  if (error) {
                      mensaje = "Error al intentar iniciar sesión";
                      estado = "error";
                  } else {
                      mensaje = "User " + data.mail + " successfully logged in.";
                      estado = "ok";
                  }

                  resultado = {
                      mensaje: mensaje,
                      estado: estado
                  };
                  console.log(mensaje);
                  res.send(resultado);

              });

          } else {
              mensaje = "Password Incorrect for username: " + data.mail;
              estado = "error";
              resultado = {
                  mensaje: mensaje,
                  estado: estado
              };
              console.log(mensaje);
              res.send(resultado);
          }
          });
    }
    else {
      resultado = {
          mensaje: "ERROR, no users registered with that email",
          estado: "error"
      };
    }
  });
});


// REGISTRAR USUARIO
router.post('/api/register', (req, res) => {

  let mensaje = '', estado = '', resultado = '', query;

  // Antes de insertar al usuario, se debe verificar si no existe ya el email ingresado

  query = 'SELECT email FROM users WHERE email = ?';

  pool.query(query, req.body.email, (error, result) => {

    if (result.length > 0) {

      resultado = {
        mensaje: "El email ya existe, intenta con otro diferente.",
        estado: "error"
      };

      res.send(resultado);

    } else {

      const user = {
        nombreCompleto: req.body.nombreCompleto,
        email: req.body.email,
        contraseña: req.body.contrasenia,
        activo: 1,
        fechaCreado: req.body.fechaCreado
      };

      //Encriptación de la contraseña
      bcrypt.hash(user.contraseña, BCRYPT_SALT_ROUNDS, (error, hashedPassword) => {

        if (error) {

          resultado = {
            mensaje: "Error en el encriptado de la contraseña.",
            estado: "error"
          };

          res.send(resultado);

        } else {

          user.contraseña = hashedPassword;

          query = 'INSERT INTO users SET ?';

          pool.query(query, user, (error, result) => {

            if (error) {
              mensaje = "Error al registrar al usuario.";
              estado = "error";
            } else {
              console.log("Se insertó el usuario: " + user.nombreCompleto + ", con id: ", result.insertId);
              mensaje = `Usuario ${user.nombreCompleto} registrado exitosamente.`;
              estado = "ok";
            }

            resultado = {
              mensaje: mensaje,
              estado: estado
            };

            res.send(resultado);

          });
        }
      });
    }
  });
});


/*
function encryptPassword(password, res){
    let hashedPsw = '', successfulEncryption = false;
    bcrypt.hash(password, BCRYPT_SALT_ROUNDS, (error, hashedPassword) => {

        if (error) {
            let resultado = {
                mensaje: "Error en el encriptado de la contraseña.",
                estado: "error"
            };
            console.log(resultado.mensaje);

            res.send(resultado);

        } else {
            console.log("SUCCESSFUL encryption");
            successfulEncryption = true;
            hashedPsw = hashedPassword;
        }
    });
    return [successfulEncryption, hashedPsw];
}

function searchDB(query, fields, successfulMessage, failureMessage, res){
    let foundUser = false;
    pool.query(query, fields, (error, result) => {

        if (result.length > 0) {
            foundUser = true;
        }
    });
    return foundUser;
}

function updateDB(query, fields, successfulMessage, failureMessage, res){
    let message = '', state = '', resultMessage = '';
    pool.query(query, fields, (error, result) => {

        if (error) {
            console.log(failureMessage);
            message = failureMessage;
            state = "error";
        } else {
            console.log(successfulMessage);
            message = successfulMessage;
            state = "ok";
        }

        resultMessage = {
            message: message,
            state: state
        };

        res.send(resultMessage);

    });
}
*/

// Se exporta la constante router para permitir requerirla desde otro archivo
module.exports = router;
