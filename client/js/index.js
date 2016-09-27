$("#navbar").load("html/base/navbar.html");
$("#main").load("html/user/testRemarkable.html");
$("#footer").load("html/base/footer.html");


$( document ).ready(function() {
    $( "#navbar-home" ).click(function() {
      console.log('home');
    });
    $( "#navbar-about-us" ).click(function() {
      console.log('about-us');
    });
    $( "#navbar-events" ).click(function() {
      console.log('events');
    });
    $( "#navbar-contact-us" ).click(function() {
      console.log('contact-us');
    });
    $("#hamburger-menu").click(function() {
        console.log("#hamburger-menu clicked");
        $( ".outside-navbar" ).toggleClass( "outside-navbar-show");
  });




});
