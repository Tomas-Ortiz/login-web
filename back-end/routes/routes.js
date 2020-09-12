const pool = require('../data/connection');

const router = app => {

  app.get('/users', (req, res) => {

    const query = 'SELECT * FROM users';
    pool.query(query, (error, result) => {
      if (error) {
        console.log(`Error en la consulta: ${error}`);
        throw error;
      }
      res.send(result);
    });
  });


};

// Se exporta la constante router para permitir referenciarla desde otro archivo (app.js)
module.exports = router;
