// admin-main-images
// json download of images
$.get({
  url: '/admin-main-images',
  success: (data) => {
    var html = data.reduce((acc, x) => {
      return acc + '<li>' + x + '</li>';
    }, '<ul>');
    html = html + '</ul>';
    $('#admin-main-images').append(html);
  },
  dataType: 'json'
});
