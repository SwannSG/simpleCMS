// admin-main-images
// json download of images
$.get({
  url: '/admin-main-images',
  success: (data) => {
    var html = data.images.reduce((acc, x) => {
      return acc + '<li><figure><img src="' + data.static + x + '" /><figcaption>' + x + '</figcaption><a href="admin-main-images-delete?image=' + x + '"><i class="material-icons">delete</i></a></figure></li>';
    }, '<ul>');
    html = html + '</ul>';
    $('#admin-main-images').append(html);
  },
  dataType: 'json'
});
