
$("#submitBtn").click(function () {
    $(".alertMessage").text("");
});

$(".alertMessage").text('');

/*clean all of the inputs from the registration form*/
function cleanRegistrationInputs() {
    $("#Register")[0].reset();
}

function showAlertMessage(message, isError = true){
    if(isError){
        $("#failureAlert").show();
        $("#successAlert").hide();
    }
    else{
        $("#successAlert").show();
        $("#failureAlert").hide();
    }

    $(".alertMessage").append(message);
}

/*Clean the value of the passwords fields*/
function cleanPasswords() {
    $("#inputCreatePassword").val('');
    $("#inputRepeatPassword").val('');
}

/*function returns true if the inputs are valid and both password fields match
* if one of this validations is false, the function returns false*/
function inputsAreValid(){
  return checkInputs() && passwordsMatch();
}

/*Function returns true if all of the inputs match their corresponding regex
* those inputs that don't match, are colored red, the rest are colored green*/
function checkInputs(){
  let flag = true;
  $(".formInput").each(function(){
      if(!matchesRegex($(this).attr("id"), $(this).val())) {
          colorInput($(this), "red");
          flag = false;
      } else {
          colorInput($(this), "green")
      }
  });
  return flag;
}

/*function returns true if both password fields have the same value*/
function passwordsMatch(){
  if ($("#inputRepeatPassword").val() !== $("#inputCreatePassword").val()) {
      showAlertMessage("<br>•Las contraseñas no coinciden");
      return false;
  }
  return true;
}

/*function changes the color of the border and text of the passed input
* the color is also passed as a parameter*/
function colorInput(input, color){
    input.css("border-color", color);
    input.css("color", color);
}

/*Function receives the id and the value of an input
* then it according to it's id, it matches it to a Regular Expression
* if the input matches the regex, the function returns false,
* else, the function returns false and shows an alert*/
function matchesRegex(inputId, inputValue){
  let flag = false;
  switch (inputId) {
      case "inputCreateName":
        /*Name can only have letters, both uppercase and lowercase,
        * it can't have symbols or numbers*/
        if (inputValue.match(/^([A-Z][a-z]+([ ]?[a-z]?[A-Z][a-z]+)*)$/gi))
          flag = true;
        else
            showAlertMessage("<br>•El nombre completo no puede contener números o símbolos");
        break;

      case "inputCreateEmail":
        if (inputValue.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g))
          flag = true;
        else
          showAlertMessage("<br>•El correo ingresado no es válido");
        break;

      case "inputCreatePassword":
        /*Password must be between 10 and 64 characters long,
        * it has to have at least one special character,
        * at least one uppercase and lowercase letter
        * and at least one number*/
        if (inputValue.match(/((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{10,64})/g))
          flag = true;
        else
          showAlertMessage("<br>•La contraseña debe tener entre 10 y 64 caracteres, " +
              "debe tener al menos 1 letra mayúscula, al menos 1 letra minúscula y al menos 1 símbolo", false);
        break;

      default:
        console.log("ERROR! wrong input type");
        break;
  }
  return flag;
}