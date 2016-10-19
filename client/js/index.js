$('#navbar').load('html/base/navbar.html');

function layoutForDevice() {
  if ($(window).width() <= 543) {
    // small screen
    $('#main').load('html/user/home.html');
    $('#footer').load('html/base/footer.html');
  } else {
    // large screen
    $('#main').load('html/user/home.html');
    $('#footer').load('html/base/footer.html');
    $('#event-stub-1').load('html/user/event-stub-1.html');
    $('#event-stub-2').load('html/user/event-stub-2.html');
    $('#event-stub-3').load('html/user/event-stub-3.html');
    $('#event-stub-4').load('html/user/event-stub-4.html');
    $('#event-stub-5').load('html/user/event-stub-5.html');
  }
}


$(document).ready(function() {
  setTimeout(function() {
    // event listeners bindings
    $('#hamburger-menu').click(function(e) {
      e.preventDefault();
      $('.outside-navbar').toggleClass('outside-navbar-show');
    });
    $('#navbar-home').click(function(e) {
      e.preventDefault();
      layoutForDevice();
    });
    $('#navbar-contact-us').click(function(e) {
      e.preventDefault();
      $('#main').load('html/user/contactUs.html');
    });
  }, 250);
  layoutForDevice();
});
