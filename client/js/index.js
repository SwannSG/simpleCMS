console.log('Start index.js');
$("#navbar").load("html/base/navbar.html");

function home() {
    if ($(window).width() <= 543) {
        // small screen
        $("#main").load("html/user/home.html");
        $("#footer").load("html/base/footer.html");
    }
    else {
        // large screen
        $("#main").load("html/user/home.html");
        $("#footer").load("html/base/footer.html");
        $("#event-1").load("html/user/event_1.html");
        $("#event-2").load("html/user/event_2.html");
    }
}


$( document ).ready(function() {
    setTimeout(function() {
        // event listeners bindings
        $("#hamburger-menu").click(function(e) {
            e.preventDefault()
            console.log("#hamburger-menu clicked");
            $( ".outside-navbar" ).toggleClass( "outside-navbar-show");
        });
        $("#navbar-home").click(function(e) {
            console.log("#navbar-home clicked")
            e.preventDefault()
            home();
        });
        $("#navbar-contact-us").click(function(e) {
            console.log("#navbar-contact-us clicked")
            e.preventDefault();
            $("#main").load("html/user/contactUs.html");;
        });



    }, 1000);
    home();
});
