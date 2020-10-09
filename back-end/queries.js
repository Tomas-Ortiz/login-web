let Query = (function () {

    return{

        selectAllWhereEmail: function () {
            return 'SELECT * FROM users WHERE email = ?';
        },

        selectEmailWhereEmail: function () {
            return 'SELECT email FROM users WHERE email = ?'
        },

        selectEmailWhereToken: function () {
            return 'SELECT email FROM users WHERE token = ?'
        },

        insertDates: function () {
            return 'INSERT INTO users_logs SET usuario_id = ? , fecha_Login = ?, hora_login = ?'
        },

        insertUser: function () {
            return 'INSERT INTO users SET ?'
        },

        updateConfirmado: function () {
            return 'UPDATE users SET confirmado = ? WHERE email = ?'
        }
    }
});

module.exports = Query();