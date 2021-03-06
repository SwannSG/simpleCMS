// admin-navbar.js

$('#admin-navbar-upload').click((e) => {
  // upload images or markdown
  e.preventDefault();
  $('#admin-main-content').load('html/admin/admin-main-upload.html');
  $.getScript('js/admin/admin-main-upload.js');
});

$('#admin-navbar-images').click((e) => {
  // show images with resource names
  e.preventDefault();
  $('#admin-main-content').load('html/admin/admin-main-images.html');
  $.getScript('js/admin/admin-main-images.js');
});
