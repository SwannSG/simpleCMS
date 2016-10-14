// admin-main-images
// json download of images
$.get({
  url: '/admin-main-images',
  success: (data) => {
    var html = data.images.reduce((acc, x) => {
      return acc + '<li><figure><img src="' + data.static + x + '" /><figcaption>' + x + '</figcaption></figure></li>';
    }, '<ul>');
    html = html + '</ul>';
    $('#admin-main-images').append(html);
  },
  dataType: 'json'
});
