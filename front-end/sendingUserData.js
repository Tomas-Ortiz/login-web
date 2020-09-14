function login() {

  let email = $("#inputEmail").val();
  let contrasenia = $("#inputPassword").val();

  const url = 'http://localhost:3001/api/login';

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
  let datosValidos = realizarComprobacionesRegistro(nombreCompleto, contrasenia, contraseniaConfirmada);

  if (datosValidos) {

    const url = 'http://localhost:3001/api/register';

    const data = {
      nombreCompleto: nombreCompleto,
      email: email,
      contrasenia: contrasenia
    };

    let resultado = enviarDatosAjax(url, data, 'post');

    if (resultado.estado === 'ok') {

      limpiarCamposRegistro();
      setTimeout(() => alert(resultado.mensaje));

      return true;
    }

    alert(resultado.mensaje);
    limpiarContraseñasRegitro();

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
    },
    error: function (data) {
      resultado = data;
    }
  });
  return resultado;
}

function realizarComprobacionesRegistro(nombreCompleto, contrasenia, contraseniaConfirmada) {

  let mensaje = '';

  if (comprobarNumeros(nombreCompleto)) {
    mensaje = "El nombre completo no puede contener números.";
  } else if (contrasenia !== contraseniaConfirmada) {
    mensaje = "Las contraseñas no coinciden.";
  } else if (contrasenia.length < 10) {
    mensaje = "La contraseña debe tener al menos 10 caracteres.";
  } else if (!comprobarMayusculas(contrasenia)) {
    mensaje = "La contraseña debe tener al menos 1 letra mayúscula.";
  } else if (!comprobarNumeros(contrasenia)) {
    mensaje = "La contraseña debe tener al menos 1 número.";
  }

  if (mensaje !== '') {
    alert(mensaje);
    return false;
  }
  return true;
}

function comprobarMayusculas(cadena) {

  for (let caracter of cadena) {
    if (caracter === caracter.toUpperCase() && isNaN(caracter)) {
      return true;
    }
  }
  return false;
}

function comprobarNumeros(cadena) {

  for (let caracter of cadena) {
    if (!isNaN(caracter) && caracter !== " ") {
      return true;
    }
  }
  return false;
}

function limpiarCamposRegistro() {
  $("#Register")[0].reset();
}

function limpiarContraseñasRegitro() {
  $("#inputCreatePassword").val('');
  $("#inputRepeatPassword").val('');
}
