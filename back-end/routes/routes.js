const pool = require('../data/connection');

//Función hash para encriptar contraseñas
const bcrypt = require('bcrypt');

// saltRounds define el costo de procesado de los datos
// Cuanto más alto es el número, más tiempo se requiere para calcular el hash asociado a la password
const BCRYPT_SALT_ROUNDS = 12;

const router = app => {

  app.get('/api/users/', (req, res) => {


  });

  app.post('/api/register', (req, res) => {

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
};

// Se exporta la constante router para permitir referenciarla desde otro archivo (app.js)
module.exports = router;
