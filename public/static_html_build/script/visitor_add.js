$(document).ready(function () {

  if($("#disabled-check-input").val() === true) {
    $("#disabled-section").show();
  } else {
    $("#disabled-section").hide();
  }

  $("#disabled-check-input").change(function (e) {
    e.preventDefault();
    if (e.target.checked === true) $("#disabled-section").show();
    else $("#disabled-section").hide();
  });

  $("#name-input")[0].setCustomValidity("This field can not be empty.");

  $("#name-input").change((e) => {
    var text = $("#name-input").val();
    text = text.trim();
    text = text.replace(/[ ]+/, " ");

    if(text === '') {
        e.target.setCustomValidity("This field can not be empty.")
    } else if(!name_regex.test(text)) {
        e.target.setCustomValidity("Only alphabets and spaces allowed")
    } else {
        e.target.setCustomValidity("")
    }

    $("#name-input").val(text);
  });
});

const name_regex = /^[A-Za-z ]+$/