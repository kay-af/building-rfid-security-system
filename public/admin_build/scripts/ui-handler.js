$(document).ready(function () {

    if($(window).width() < $(window).height()) {
        $("#not-supported").show();
    } else {
        $("#not-supported").hide();
    }

    $(window).resize(updateResize);
});

function updateResize() {
  var width = $(window).width();
  var height = $(window).height();

  if (width < height) {
    $("#not-supported").fadeIn(400)
  } else {
    $("#not-supported").fadeOut(400)
  }
}
