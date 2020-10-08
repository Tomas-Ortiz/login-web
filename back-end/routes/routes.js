const mailer = require('../email/verify');
const crypto = require('crypto');

const {Router} = require('express');
const router = Router();
const pool = require('../data/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secret_key = require('../keys/keys');

//const service = require('../service');
const queries = require('../queries');

var LocalStorage = require('node-localstorage').LocalStorage,
  localStorage = new LocalStorage('./scratch');

// saltRounds define el costo de procesado de los datos
// Cuanto más alto es el número, más tiempo se requiere para calcular el hash asociado a la password
const BCRYPT_SALT_ROUNDS = 12;

let resultado = {
    mensaje: "",
    estado: "error"
};



//TEST SEND EMAILS
router.get('/send-email', (req, res) => {
  let send = mailer.sendMailToUser;
  let message = send("juanaugustolombino@protonmail.ch", 20);
  res.send(message)
});

//USER CONFIRMS EMAIL
router.get('/confirm/', (req, res) => {
    let url = {
      token: req.query.token,
      mail: req.query.mail
    };

    pool.getConnection(function (error, connection) {
      connection.beginTransaction(function (error) {
        if(error){
          connection.rollback(function () {
            connection.release();
            throw error;
          });
        }

        //Check that the emails exist first
        pool.query(queries.selectEmailWhereToken(), url.token, (error, result) => {



          if (error) {
            connection.rollback(function () {
              connection.release();
              throw error;
            });
          }

          try{

            if (result.length > 0){

              let decryptedMail = result[0].email;

              //Compare decryptedMail from DATABASE, with encrypted mail from URL
              bcrypt.compare(decryptedMail, url.mail, function (error, result) {
                if (error) {
                  console.log("DecryptedMail: %s", decryptedMail);
                  console.log("MAIL from URL: %s", url.mail);
                  resultado.mensaje = "Error al encriptar el correo";
                  res.send(resultado);
                } else {
                  console.log(`USER: ${decryptedMail} is TRYING TO CONFIRM his account`);
                  //The email exists, now set Confirmado = 1
                  pool.query(queries.updateConfirmado(), [1, decryptedMail], (error, result) => {
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
                          resultado.mensaje = "USER: " + url.mail + " CONFIRMED his account SUCCESSFULLY";
                          resultado.estado = "ok";
                          console.log(resultado.mensaje);
                          //Redirect user to login page
                          res.redirect('/login');

                      });
                  });
                }
              });


            } else{
                resultado.mensaje = "No user with that email exists";
                console.log(resultado.mensaje);
                res.send(resultado);
            }

          } catch (e) {
              resultado.mensaje = "Error interno del servidor: " + e;
              res.send(resultado);
          }

        });

      });
    });
});



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

    console.log("*****************************************");
    console.log(req.userData.nombreCompleto);

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
        pool.query(queries.selectAllWhereEmail(), data.mail, (error, result) => {

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

                    resultado.mensaje = "Error al encriptar la contraseña.";
                    res.send(resultado);

                  } else if (isMatch) {

                    if (userResult.activo === 0) {

                      resultado.mensaje = "No puedes iniciar sesión debido a que la cuenta se encuentra bloqueada.";
                      res.send(resultado);

                    } else {

                      pool.query(queries.insertDates(), [userResult.id, data.loginDate, data.loginTime], (error, result) => {
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


                          resultado.estado = "Usuario " + data.mail + " ha iniciado sesión correctamente.";
                          resultado.estado = "ok";

                          res.send(resultado);

                        } catch (e) {

                          resultado.estado = "Error interno del servidor: " + e;
                          res.send(resultado);

                        }
                      });
                    }
                  } else {

                    resultado.mensaje = "Correo electrónico o contraseña incorrectos.";
                    res.send(resultado);

                  }
                });
              } else {

                resultado.mensaje = "El correo electrónico ingresado no está registrado.";
                res.send(resultado);

              }
            } catch (e) {

              resultado.mensaje = "Error interno del servidor: " + e;
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

  // Antes de insertar al usuario, se debe verificar si no existe ya el email ingresado

  pool.getConnection(function (error, connection) {
    connection.beginTransaction(function (error) {
      if (error) {
        connection.rollback(function () {
          connection.release();
          throw error;
        });
      }

      pool.query(queries.selectEmailWhereEmail(), req.body.email, (error, result) => {

        if (error) {
          connection.rollback(function () {
            connection.release();
            throw error;
          })
        }

        try {
          if (result.length > 0) {

            resultado.mensaje = "No se pudo registrar al usuario porque el email ingresado ya existe.";
            res.send(resultado);

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

            bcrypt.hash(user.contraseña, BCRYPT_SALT_ROUNDS, (error, hashedPassword) => {

              if (error) {

                resultado.mensaje = "Error en el encriptado de la contraseña.";
                res.send(resultado);

              } else {
                user.contraseña = hashedPassword;

                pool.query(queries.insertUser(), user, (error, result) => {
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
                    resultado.mensaje = `Usuario ${user.nombreCompleto} con id ${result.insertId} registrado exitosamente.`;
                    resultado.estado = "ok";

                    //HASH EMAIL OF THE USER BEFORE SENDING IT VIA MAIL
                    bcrypt.hash(user.email, BCRYPT_SALT_ROUNDS, (error, mailHashed) => {

                      if(error){
                        resultado.mensaje = "Error en el encriptado de la contraseña.";
                        res.send(resultado);
                      } else {

                        user.email = mailHashed;

                        //User registered successfully, now try to send the verification email
                        mailer.sendMailToUser(user.email, user.token);

                        res.send(resultado);

                      }
                    });

                  } catch (e) {

                    resultado.mensaje = "Error interno del servidor: " + e;
                    res.send(resultado);
                  }
                });
              }
            });
          }
        } catch (e) {
          resultado.mensaje = "Error interno del servidor: " + e;
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
    console.log("Token generado: ", userToken);
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

exports.router = router;
