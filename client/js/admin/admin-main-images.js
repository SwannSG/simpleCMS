// admin-main-images
// window.admin is a global object
var admin = window.admin;

// json download of images
$.get({
  url: '/admin-main-images',
  success: (data) => {
    admin.imagesData = data;
    var html = admin.htmlForImages(data.static, data.images);
    $('#admin-main-images').empty();
    $('#admin-main-images').append(html);
  },
  dataType: 'json'
});

admin.deleteImage = (image) => {
  // delete image on server
  $.ajax({
    url: '/admin-main-images-delete',
    type: 'DELETE',
    success: (data) => {
      console.log(data);
    },
    data: JSON.stringify({
      imageName: image
    }),
    contentType: 'application/json'
  });
  // update the local DOM
  var arrIndex = admin.imagesData.images.findIndex((x) => {
    return x === image;
  });
  admin.imagesData.images.splice(arrIndex, 1);
  var html = admin.htmlForImages(admin.imagesData.static, admin.imagesData.images);
  $('#admin-main-images').empty();
  $('#admin-main-images').append(html);
};

admin.htmlForImages = (staticDir, arrImages) => {
  var html = arrImages.reduce((acc, x) => {
    return acc + '<li><figure><img src = "' + staticDir + x + '"/><figcaption> ' + x + ' </figcaption><a href="javascript:void(0)" onclick="admin.deleteImage(\'' + x + '\');"><i class="material-icons">delete</i></a></figure></li>';
  }, '<ul>');
  return html + '</ul>';
};
