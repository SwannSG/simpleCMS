$('#admin-navbar-upload').click((e) => {
    e.preventDefault();
    console.log('upload');
    $("#admin-main-content").load("html/admin/admin-main-upload.html");
    $.getScript("js/admin/admin-main-upload.js");
});
$('#admin-navbar-download')
$('#admin-navbar-delete')
