console.log('Start index.js');
$("#navbar").load("html/base/navbar.html");

$( document ).ready(function() {
    setTimeout(function() {
        $("#hamburger-menu").click(function(e) {
            e.preventDefault()
            console.log("#hamburger-menu clicked");
            $( ".outside-navbar" ).toggleClass( "outside-navbar-show");
    })}, 1000);
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
});
