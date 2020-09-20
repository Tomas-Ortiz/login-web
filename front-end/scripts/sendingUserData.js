function login() {

  let email = $("#inputEmail").val();
  let contrasenia = $("#inputPassword").val();

  const url = 'http://localhost:3000/api/login';

  const data = {
    email: email,
    contrasenia: contrasenia
  };

  enviarDatosAjax(url, data, 'post');

}

function register() {

  let nombreCompleto = $("#inputCreateName").val();
  let email = $("#inputCreateEmail").val();
  let contrasenia = $("#inputCreatePassword").val();
  let contraseniaConfirmada = $("#inputRepeatPassword").val();

  //retorna true si los datos ingresados son válidos
  if (inputsAreValid()) {

    const url = 'http://localhost:3000/api/register';

    const data = {
      nombreCompleto: nombreCompleto,
      email: email,
      contrasenia: contrasenia
    };

    let resultado = enviarDatosAjax(url, data, 'post');

    if (resultado.estado === 'ok') {

        cleanRegistrationInputs();
      setTimeout(() => alert(resultado.mensaje));

      return true;
    }

    alert(resultado.mensaje);
    cleanPasswords();

    return false;

  } else {
    return false;
  }
}

function enviarDatosAjax(url, data, method) {

  let resultado = '';

  $.ajax({
    url: url,
    method: method,
    async: false,
    data: data,
    success: function (data) {
      resultado = data;
      console.log(resultado);
    },
    error: function (data) {
      resultado = data;
      console.log(resultado);
    }
  });
  return resultado;
}

