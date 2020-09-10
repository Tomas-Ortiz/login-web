function login() {

  let email = $("#inputEmail").val();
  let contrasenia = $("#inputPassword").val();

  const url = 'http://localhost:63342/api/login';

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

    const url = 'http://localhost:63342/api/register';

    const data = {
      nombreCompleto: nombreCompleto,
      email: email,
      contrasenia: contrasenia,
      contraseniaConfirmada: contraseniaConfirmada
    };

    enviarDatosAjax(url, data, 'post');

  } else {
    return false;
  }
}

function enviarDatosAjax(url, data, type) {

  $.ajax({
    url: url,
    type: type,
    data: data,
    success: function (data) {
      console.log(data);
    },
    error: function (data) {
      console.log(data);
    }
  });

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
