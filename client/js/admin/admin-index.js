console.log('Start admin-index.js');
$("#admin-navbar").load("html/admin/admin-navbar.html");

function home() {
    if ($(window).width() <= 543) {
        // small screen
    }
    else {
        // large screen
    }
}

$( document ).ready(function() {
    setTimeout(() => {
        // load js file
        console.log('doc ready timeout');
        $.getScript( "js/admin/admin-navbar.js", (data, textStatus, jqxhr ) => {

        });
    }, 1000);
});
