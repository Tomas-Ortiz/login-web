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

  //CONTROLAR SIMBOLOS
  //CONTROLAR FORMATO EMAIL

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

