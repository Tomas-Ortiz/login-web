let Query = (function () {

    return{

        selectAllWhereEmail: function () {
            return 'SELECT * FROM users WHERE email = ?';
        },

        insertDates: function () {
            return 'INSERT INTO users_logs SET usuario_id = ? , fecha_Login = ?, hora_login = ?'
        },

        selectEmailWhereEmail: function () {
            return 'SELECT email FROM users WHERE email = ?'
        },

        insertUser: function () {
            return 'INSERT INTO users SET ?'
        }
    }

});

module.exports = Query();