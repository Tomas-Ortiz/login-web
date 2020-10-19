const pool = require('../Data/connection');

let Query = (function () {
  return {

    selectAllWhereEmail: function (email) {
      return pool.query('SELECT * FROM users WHERE email = ?', email);
    },

    selectEmailWhereEmail: function (email) {
      return pool.query('SELECT email FROM users WHERE email = ?', email);
    },

    selectEmailWhereToken: function (token) {
      return pool.query('SELECT email FROM users WHERE token = ?', token);
    },

    insertDates: function (id, fecha_login, hora_login) {
      return pool.query('INSERT INTO users_logs SET usuario_id = ? , fecha_Login = ?, hora_login = ?', [id, fecha_login, hora_login])
    },

    insertUser: function (user) {
      return pool.query('INSERT INTO users SET ?', user);
    },

    updateConfirmado: function (confirmado, email) {
      return pool.query('UPDATE users SET confirmado = ? WHERE email = ?', [confirmado, email]);
    }
  }
});

module.exports = Query();
