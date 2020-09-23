$("#submitRegister").click(function () {
  $(".alertMessage").text("");
  $("#failureAlert").hide();
  $("#successAlert").hide();
});

/*clean all of the inputs from the registration form*/
function cleanRegistrationInputs() {
  $("#Register")[0].reset();
}

function cleanInputsColors() {
  colorInput($("#inputCreateName"), "");
  colorInput($("#inputCreateEmail"), "");
  colorInput($("#inputCreatePassword"), "");
  colorInput($("#inputRepeatPassword"), "");
}

function showAlertMessage(message, isError = true) {

  if (isError) {
    $("#successAlert").hide();
    $("#failureAlert").show();
  }

  $(".alertMessage").append(message);
}

/*Clean the value of the passwords fields*/
function cleanPasswordsRegister() {
  $("#inputCreatePassword").val('');
  $("#inputRepeatPassword").val('');
}

/*function returns true if the inputs are valid and both password fields match
* if one of this validations is false, the function returns false*/
function inputsRegisterAreValid() {
  return checkInputsRegister() && passwordsMatchRegister();
}

function inputsLoginAreValid() {
  return !($("#inputEmail").val() === '' || $("#inputPassword").val() === '');
}

/*Function returns true if all of the inputs match their corresponding regex
* those inputs that don't match, are colored red, the rest are colored green*/
function checkInputsRegister() {

  let valid = true;

  $(".formInput").each(function () {

    let idInput = $(this).attr("id");
    let valorInput = $(this).val();

    if (!matchesRegex(idInput, valorInput)) {
      colorInput($(this), "red");
      valid = false;
    } else {
      colorInput($(this), "green")
    }
  });

  return valid;
}

/*function returns true if both password fields have the same value*/
function passwordsMatchRegister() {

  let idInputCreate = $("#inputCreatePassword");
  let idInputRepeat = $("#inputRepeatPassword");

  if (idInputRepeat.val() !== idInputCreate.val()) {

    showAlertMessage("<br>• Las contraseñas no coinciden.");

    cleanPasswordsRegister();

    colorInput(idInputCreate, "red");
    colorInput(idInputRepeat, "red");

    return false;
  }
  return true;
}

/*function changes the color of the border and text of the passed input
* the color is also passed as a parameter*/
function colorInput(input, color) {
  input.css("border-color", color);
  input.css("color", color);
}

/*Function receives the id and the value of an input
* then it according to it's id, it matches it to a Regular Expression
* if the input matches the regex, the function returns false,
* else, the function returns false and shows an alert*/
function matchesRegex(inputId, inputValue) {

  let valid = false;

  switch (inputId) {
    case "inputCreateName":
      /*Name can only have letters, both uppercase and lowercase,
      * it can't have symbols or numbers*/
      if (inputValue.match(/^([A-Z][a-z]+([ ]?[a-z]?[A-Z][a-z]+)*)$/gi))
        valid = true;
      else
        showAlertMessage("<br>• El nombre no puede estar vacío, contener números, símbolos o espacios muy grandes.");
      break;

    case "inputCreateEmail":
      if (inputValue.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g))
        valid = true;
      else
        showAlertMessage("<br>• El correo electrónico está vacío o el formato ingresado no es válido.");
      break;

    case "inputCreatePassword":
      /*Password must be between 10 and 64 characters long,
      * it has to have at least one special character,
      * at least one uppercase and lowercase letter
      * and at least one number*/
      if (inputValue.match(/((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{10,64})/g))
        valid = true;
      else {
        cleanPasswordsRegister();
        showAlertMessage("<br>• La contraseña no puede estar vacía y debe contener al menos: <br>- Entre 10 y 64 caracteres" +
          "<br>- 1 Letra mayúscula <br>- 1 Letra minúscula <br>- 1 Símbolo");
      }
      break;

    default:
      console.log("ERROR! wrong input type");
      break;
  }
  return valid;
}
