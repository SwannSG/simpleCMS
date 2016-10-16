// admin-index.js

$('#admin-navbar').load('html/admin/admin-navbar.html');

$(document).ready(function() {
  setTimeout(() => {
    $.ajax({
      url: 'js/admin/admin-navbar.js',
      dataType: 'script',
      success: () => {
        // set a global admin object
        window.admin ? window.admin : window.admin = {};
      }
    });
  }, 100);
});
