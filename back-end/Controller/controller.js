const {Router} = require('express');
const router = Router();

const serviceRegister = require('../Services/serviceRegister');
const serviceToken = require('../Services/serviceToken');
const serviceLogin = require('../Services/serviceLogin');
const serviceCache = require('../Services/serviceCache');
const serviceConfirmAccount = require('../Services/serviceConfirmAccount');

// CONFIRMACIÓN DE CUENTA
router.get('/confirm/', async (req, res) => {
  let resultado = await serviceConfirmAccount.confirmAccount(req);
  if (resultado.estado === 'ok') {
    res.redirect('/login');
  } else {
    res.send(resultado);
  }
});

// RENDERIZAR PÁGINA DE REGISTRO
router.get('/register', (req, res) => {
  res.render('register.html');
});

//INICIAR SESIÓN
router.get('/login', serviceToken.verificarToken, (req, res) => {
  if (res.resultado.verificado) {
    res.redirect('/user/profile');
  } else {
    res.render('login.html');
  }
});

// PERFIL DEL USUARIO: Ruta protegida, se requiere un token para acceder
// No caché para esta url. se evita que se cargue sin hacer la petición
router.get('/user/profile', serviceCache.noCache, serviceToken.verificarToken, (req, res) => {
  if (res.resultado.verificado) {
    // Se obtienen los datos del usuario directamente del token
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
router.post('/api/login', async (req, res) => {
  let resultado = await serviceLogin.login(req);
  res.send(resultado);
});

// REGISTRAR USUARIO
router.post('/api/register', async (req, res) => {
  let resultado = await serviceRegister.userRegister(req);
  res.send(resultado);
});

// CERRAR SESIÓN
router.get('/user/logout', (req, res) => {
  serviceToken.removeToken();
  res.redirect('/login');
});

exports.router = router;
