async function login() {
  let email = $("#inputEmail").val();
  let contrasenia = $("#inputPassword").val();
  let fechaLogin = getCurrentDate().toString();
  let horaLogin = getCurrentTime().toString();

  //retorna true si los datos ingresados son válidos y las contraseñas coinciden
  if (inputsLoginAreValid()) {

    const url = 'http://localhost:3000/api/login';

    const data = {
      email: email,
      contrasenia: contrasenia,
      fechaLogin: fechaLogin,
      horaLogin: horaLogin
    };

    try {
      let result = await enviarDatosAjax(url, data, 'post');

      if (result.estado === 'ok') {
        window.location = "http://localhost:3000/user/profile";
      } else {
        $("#inputPassword").val("");
        colorInput($("#inputEmail"), "red");
        colorInput($("#inputPassword"), "red");

        $("#alertMessageLogin").text("• " + result.mensaje);
        $(".alert").show();
      }
    } catch (err) {
      console.log("Error" + err);
    }
  } else {
    $("#alertMessageLogin").text("• Complete todos los campos solicitados.");
    $(".alert").show();
  }
}

async function register() {
  let nombreCompleto = $("#inputCreateName").val();
  let email = $("#inputCreateEmail").val();
  let contrasenia = $("#inputCreatePassword").val();
  let fechaCreado = getCurrentDate().toString();

  if (inputsRegisterAreValid()) {
    const url = 'http://localhost:3000/api/register';

    const data = {
      nombreCompleto: nombreCompleto,
      email: email,
      contrasenia: contrasenia,
      fechaCreado: fechaCreado
    };

    try {
      let resultado = await enviarDatosAjax(url, data, 'post');

      if (resultado.estado === 'ok') {
        cleanRegistrationInputs();
        cleanInputsColors();

        $("#failureAlert").hide();
        $(".alertMessage").text("• Usuario registrado con éxito. Por favor, verifica el email enviado a tu correo para la confirmación de la cuenta.");
        $("#successAlert").show();
      } else {
        cleanPasswordsRegister();
        cleanRegistrationInputs();
        cleanInputsColors();

        colorInput($("#inputCreatePassword"), "");
        colorInput($("#inputRepeatPassword"), "");

        $("#successAlert").hide();
        $(".alertMessage").text("• " + resultado.mensaje);
        $("#failureAlert").show();
      }
    } catch (err) {
      console.log("Error" + err);
    }
  }
}

async function enviarDatosAjax(url, data, method) {
  var resultado;
  try {
    await $.ajax({
      url: url,
      method: method,
      data: data,
      success: function (data) {
        resultado = data;
      }
    });
  } catch (error) {
    resultado.mensaje = "Error en la petición ajax " + error;
    resultado.estado = "error";
  }
  return resultado;
}

function getCurrentDate() {
  return new Date().toLocaleDateString();
}

function addZero(num) {
  if (num < 10) {
    num = "0" + num;
  }
  return num;
}

function getCurrentTime() {
  let today = new Date();
  let hour = addZero(today.getHours());
  let min = addZero(today.getMinutes());
  let sec = addZero(today.getSeconds());
  return hour + ':' + min + ':' + sec;
}
