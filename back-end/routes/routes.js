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

  //Verificar que el correo existe en la base de datos

  query = 'SELECT email FROM users WHERE email = ?';

  pool.query(query, req.body.email, (error, result) => {

    if (result.length > 0) {
      resultado = {
        mensaje: "SUCCESS DUDE",
        estado: "ok"
      };
      res.send(resultado);

    }
    else{
        resultado = {
          mensaje: "ERROR, no usernames detected",
          estado: "error"
        };
        res.send(resultado);
    }
  });

});



router.get('/api/prueba', (req, res) => {
    res.send({estado: 'ok', mensaje: 'peticion recibida'})
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
        estado: "ok"
      };

      res.send(resultado);

    } else {

      const user = {
        nombreCompleto: req.body.nombreCompleto,
        email: req.body.email,
        contraseña: req.body.contrasenia,
        activo: 1
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
              console.log("Se insertó el usuario con id ", result.insertId);
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

// Se exporta la constante router para permitir requerirla desde otro archivo
module.exports = router;
