// Router es una clase de express
const {Router} = require('express');
const router = Router();
const pool = require('../data/connection');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const secret_key = require('../keys/keys');

// saltRounds define el costo de procesado de los datos
// Cuanto más alto es el número, más tiempo se requiere para calcular el hash asociado a la password
const BCRYPT_SALT_ROUNDS = 12;

router.get('/login', verificarToken, (req, res) => {

  if (res.resultado.estado === 'ok') {
    res.redirect('/user/profile');
  } else {
    res.render('login.html');
  }

});
router.get('/register', (req, res) => {

  res.render('register.html');

});

// Ruta protegida, se requiere JWT para acceder
// verificarToken actúa como middleware
router.get('/user/profile', verificarToken, (req, res) => {

  if (res.resultado.estado === 'ok') {
    res.render('profile.html');
  } else {
    res.redirect('/login');
  }

});

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
  query = 'SELECT * FROM users WHERE email = ?';

  pool.query(query, data.mail, (error, result) => {

    if (result.length > 0) {

      let userResult = result[0];

      data.hashedPassword = userResult.contraseña;

      bcrypt.compare(data.password, data.hashedPassword, (error, isMatch) => {

        if (error) {

          resultado = {
            mensaje: "An error has ocurred trying to encrypt your password",
            estado: "error"
          };

          res.send(resultado);

        } else if (isMatch) {

          if (userResult.activo === 0) {

            resultado = {
              mensaje: "No puedes iniciar sesión debido a que la cuenta se encuentra bloqueada.",
              estado: "error"
            };

            res.send(resultado);

          } else {

            console.log("User " + data.mail + " has logged in (" + data.loginDate + ")");

            query = 'UPDATE users SET fechaLogin = ? WHERE email = ?';

            pool.query(query, [data.loginDate, data.mail], (error, result) => {

              if (error) {
                mensaje = "Error al actualizar la fecha de login.";
                estado = "error";
              } else {
                mensaje = "User " + data.mail + " successfully logged in.";
                estado = "ok";

                try {
                  // El token del usuario se genera a partir de los datos del mismo y de la clave secreta
                  // y se almacena en una cookie

                  let userData = {
                    id: userResult.id,
                    nombreCompleto: userResult.nombreCompleto,
                    email: userResult.email,
                    confirmado: userResult.confirmado,
                    rol: userResult.rol,
                    fechaLogin: userResult.fechaLogin
                  };

                  const userToken = jwt.sign({userData}, secret_key);

                  console.log("Token generado al usuario ", userResult.nombreCompleto, ":", userToken);
                  /* La cookie no se puede leer usando js (document.cookie), no visibles en frontend
                   Secure true solo para https */
                  res.cookie('userToken', userToken);

                } catch (error) {
                  console.log("Error en el token: ", error);
                }
              }

              resultado = {
                mensaje: mensaje,
                estado: estado,
              };

              console.log(mensaje);
              res.send(resultado);

            });
          }

        } else {
          mensaje = "Correo electrónico o contraseña incorrectos.";
          estado = "error";
          resultado = {
            mensaje: mensaje,
            estado: estado
          };

          console.log(mensaje);
          res.send(resultado);
        }
      });

    } else {
      resultado = {
        mensaje: "No existe ningún usuario con ese correo electrónico.",
        estado: "error"
      };
      res.send(resultado);
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

function verificarToken(req, res, next) {

  let resultado, mensaje, estado;
  const token = req.cookies.userToken;

  try {
    if (token) {
      // userData retorna los datos descifrados contenidos en el token
      jwt.verify(token, secret_key, (error, userData) => {
        if (error) {
          mensaje = "Error, token inválido.";
          estado = "error";

          //res.sendStatus(403);
        } else {
          mensaje = "Token válido.";
          estado = "ok";
          req.userData = userData;
        }
      });
    } else {
      mensaje = "Se requiere un token, debes loguearte.";
      estado = "error";
      //res.sendStatus(403);
    }
  } catch (error) {
    mensaje = "Ha ocurrido un error inesperado.";
    estado = "error";
    //res.sendStatus(500);
  }
  resultado = {
    mensaje: mensaje,
    estado: estado
  };
  res.resultado = resultado;
  next();
}

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
exports.router = router;
