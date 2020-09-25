const {Router} = require('express');
const router = Router();
const pool = require('../data/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secret_key = require('../keys/keys');
var LocalStorage = require('node-localstorage').LocalStorage,
  localStorage = new LocalStorage('./scratch');

// saltRounds define el costo de procesado de los datos
// Cuanto más alto es el número, más tiempo se requiere para calcular el hash asociado a la password
const BCRYPT_SALT_ROUNDS = 12;

router.get('/register', (req, res) => {
  res.render('register.html');
});

router.get('/login', verificarToken, (req, res) => {

  if (res.resultado.verificado) {
    res.redirect('/user/profile');
  } else {
    res.render('login.html');
  }
});

// Ruta protegida, se requiere un token para acceder
// No caché para esta url. se evita que se cargue sin hacer la petición
router.get('/user/profile', noCache, verificarToken, (req, res) => {

  if (res.resultado.verificado) {

    // Para ahorrar consultas a la bd se obtienen los datos del usuario directamente del token
    let user = req.userData;

    res.render('profile.html', {
      nombre: user.nombreCompleto,
      correo: user.email,
      confirmado: user.confirmado,
      activo: user.activo,
      rol: user.rol,
      fechaCreado: user.fechaCreado
    });

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
    loginDate: req.body.fechaLogin,
    loginTime: req.body.horaLogin
  };

  pool.getConnection(function (error, connection) {
    connection.beginTransaction(function (error) {
        if (error) {
          connection.rollback(function () {
            connection.release();
            throw error;
          });
        }

        //Search database for the corresponding email and select both hashed password and email
        query = 'SELECT * FROM users WHERE email = ?';
        pool.query(query, data.mail, (error, result) => {

            if (error) {
              connection.rollback(function () {
                connection.release();
                throw error;
              });
            }

            try {
              if (result.length > 0) {

                let userResult = result[0];

                data.hashedPassword = userResult.contraseña;

                bcrypt.compare(data.password, data.hashedPassword, (error, isMatch) => {

                  if (error) {
                    resultado = {
                      mensaje: "Error al encriptar la contraseña.",
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
                      query = 'INSERT INTO users_logs SET usuario_id = ? , fecha_Login = ?, hora_login = ?';
                      pool.query(query, [userResult.id, data.loginDate, data.loginTime], (error, result) => {
                        if (error) {
                          connection.rollback(function () {
                            connection.release();
                            throw error;
                          })
                        }
                        // commit en la última consulta
                        connection.commit(function (error) {
                          if (error) {
                            connection.rollback(function () {
                              connection.release();
                              throw error;
                            })
                          }
                          connection.release();
                        });

                        try {

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
                          generarToken(userData);

                          resultado = {
                            mensaje: "Usuario " + data.mail + " ha iniciado sesión correctamente.",
                            estado: "ok",
                          };

                          res.send(resultado);

                        } catch (e) {
                          resultado = {
                            mensaje: "Error interno del servidor: " + e,
                            estado: "error"
                          };

                          res.send(resultado);

                        }
                      });
                    }
                  } else {
                    mensaje = "Correo electrónico o contraseña incorrectos.";
                    estado = "error";
                    resultado = {
                      mensaje: mensaje,
                      estado: estado
                    };

                    res.send(resultado);

                  }
                });
              } else {
                resultado = {
                  mensaje: "El correo electrónico ingresado no está registrado.",
                  estado: "error"
                };

                res.send(resultado);
              }
            } catch (e) {
              resultado = {
                mensaje: "Error interno del servidor: " + e,
                estado: "error"
              };

              res.send(resultado);

            }
          }
        );
      }
    );
  });
});

// REGISTRAR USUARIO
router.post('/api/register', (req, res) => {

  let mensaje = '', estado = '', resultado = '', query;

  // Antes de insertar al usuario, se debe verificar si no existe ya el email ingresado
  query = 'SELECT email FROM users WHERE email = ?';

  pool.getConnection(function (error, connection) {
    connection.beginTransaction(function (error) {
      if (error) {
        connection.rollback(function () {
          connection.release();
          throw error;
        });
      }

      pool.query(query, req.body.email, (error, result) => {

        if (error) {
          connection.rollback(function () {
            connection.release();
            throw error;
          })
        }

        try {
          if (result.length > 0) {
            resultado = {
              mensaje: "No se pudo registrar al usuario porque el email ingresado ya existe.",
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
                    connection.rollback(function () {
                      connection.release();
                      throw  error;
                    })
                  }

                  connection.commit(function (error) {
                    if (error) {
                      connection.release();
                      throw error;
                    }
                    connection.release();
                  });

                  try {
                    mensaje = `Usuario ${user.nombreCompleto} con id ${result.insertId} registrado exitosamente.`;
                    estado = "ok";

                    resultado = {
                      mensaje: mensaje,
                      estado: estado
                    };

                    console.log(resultado.mensaje);

                    res.send(resultado);

                  } catch (e) {
                    resultado = {
                      mensaje: "Error interno del servidor: " + e,
                      estado: "error"
                    };
                    res.send(resultado);
                  }
                });
              }
            });
          }
        } catch (e) {
          resultado = {
            mensaje: "Error interno del servidor: " + e,
            estado: "error"
          };
          res.send(resultado);
        }
      });
    });
  });
});

router.get('/user/logout', (req, res) => {

  if (localStorage.getItem('token')) {
    localStorage.removeItem('token');
  }
  res.redirect('/login');
});

// Se agregan estos encabezados en la respuesta
function noCache(req, res, next) {

  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');

  next();
}

function generarToken(userData) {

  const userToken = jwt.sign({userData}, secret_key);
  localStorage.setItem('token', userToken);
  console.log("Token generado al usuario ", userData.nombreCompleto);
}

function verificarToken(req, res, next) {

  let resultado, mensaje, verificado;

  const token = localStorage.getItem('token');

  try {
    if (token) {
      // data retorna los datos descifrados contenidos en el token
      jwt.verify(token, secret_key, (error, data) => {
        if (error) {
          mensaje = "Error, token inválido.";
          verificado = false;
        } else {
          mensaje = "Token válido.";
          verificado = true;
          req.userData = data.userData;
        }
      });
    } else {
      mensaje = "Se requiere un token.";
      verificado = false;
    }
  } catch (error) {
    mensaje = "Ha ocurrido un error inesperado.";
    verificado = false;
  }
  resultado = {
    mensaje: mensaje,
    verificado: verificado
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
exports.router = router;
