const router = app => {

  app.get('/', (req, res) => {
    res.send({
      mensaje: 'Node.js y express funcionando'
    });
  });



};

// Se exporta la constante router para permitir referenciarla desde otro archivo (app.js)
module.exports = router;
