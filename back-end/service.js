const jwt = require('jsonwebtoken');
const secret_key = require('./keys/keys');


let Service = (function () {
    return{

        noChache: function (req, res, next) {

            res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
            res.header('Expires', '-1');
            res.header('Pragma', 'no-cache');

            next();
        },

        token: {

            generarToken: function (userData) {

                const userToken = jwt.sign({userData}, secret_key);
                localStorage.setItem('token', userToken);
                console.log("Token generado al usuario ", userData.nombreCompleto);
            },

            verificarToken: function (req, res, localStorage) {
                let mensaje, verificado;

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

                return {
                    mensaje: mensaje,
                    verificado: verificado
                }

            }

        }

    }
});

module.exports = Service();