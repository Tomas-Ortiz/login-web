const jwt = require('jsonwebtoken');
const secret_key = require('../Data/keys');
var LocalStorage = require('node-localstorage').LocalStorage,
  localStorage = new LocalStorage('./scratch');

function removeToken() {
  if (localStorage.getItem('token')) {
    localStorage.removeItem('token');
  }
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
      // Data retorna los datos descifrados contenidos en el token
      jwt.verify(token, secret_key, (error, data) => {
        if (!error) {
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
    mensaje = "Ha ocurrido un error inesperado: " + error;
    verificado = false;
  }
  resultado = {
    mensaje: mensaje,
    verificado: verificado
  };
  res.resultado = resultado;
  next();
}

exports.removeToken = removeToken;
exports.verificarToken = verificarToken;
exports.generarToken = generarToken;
