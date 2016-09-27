console.log('Start index.js');
$("#navbar").load("html/base/navbar.html");
$("#main").load("html/user/home.html");
$("#footer").load("html/base/footer.html");
$("#event-1").load("html/user/event_1.html");
$("#event-2").load("html/user/event_2.html");



$( document ).ready(function() {
    setTimeout(function() {
        // delay to allow DOM to be ready for event listeners
        $("#navbar-home" ).click(function() {
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
        $("#hamburger-menu").click(function(e) {
            e.preventDefault()
            console.log("#hamburger-menu clicked");
            $( ".outside-navbar" ).toggleClass( "outside-navbar-show");
      })}, 1000);

});
