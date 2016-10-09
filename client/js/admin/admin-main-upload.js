// import $ from 'jquery';

$('#admin-upload-form').submit(e => {
  // before submit we need to have
  // 1. an attached file
  // 2. an attached file with a valid (image or markdown) extension
  // 3. if the user renames the file, is the new user designated filename either an image or markdown file
  // 3b. does the user filename have a valid extension
  // img (jpg, jpeg, png, etc.) or md (*.md)
  // 4. if not show an error message and don't submit
  // 5. else
  // 6. set input file-type to value img or md

  console.log('submit');

  var form = $(this); // this is the global window object

  if (this === window) {
      // true
    console.log('this === window');
  }
  if (form === window) {
      // false
    console.log('form === window');
  }

  /** returns 'fileExt' from '*.fileExt' file name.
   *  abc.def returns 'def'
   */
  function fileExt(string) {
    if (string.indexOf('.') < 0) {
      return '';
    }
    return string.split('.')[1].toUpperCase();
  }


  /** @return boolean
   *  abc.def returns 'def'
   */
  function isValidFileExtension(fileExtension) {
    if (extToTest.hasOwnProperty(fileExtension)) {
      return true;
    }
    return false;
  }

  function showErrorMsg(selector, text) {
      $(selector).text(text);
      setTimeout(() => {
          $(id).text('');
      }, 2000);
  }

  function getFileType(fileExtension) {
      return extToTest[fileExtension];
  }

  var extToTest = {
      MD: 'md',
      JPEG: 'img',
      JPG: 'img',
      PNG: 'img',
      GIFF: 'img',
      GIF: 'img'
  };

  // is file to upload valid
  var uploadFile = $('#admin-main-upload-file').val();
  uploadFile = (uploadFile)
      ? uploadFile.split('\\')[2]
      : '' // extract filename
  var uploadFileExtension = fileExt(uploadFile)
  if (isValidFileExtension(uploadFileExtension)) {
      // set hidden field file-type
      var fileType = getFileType(uploadFileExtension);
      $("#admin-main-upload-file-type").val(fileType);
  } else {
      // the attached file is invalid
      showErrorMsg('#admin-upload-file-error-msg', 'File not accepted.');
      e.preventDefault();
  }

  // user filename
  var userFilename = $('#admin-main-upload-user-filename').val();
  var userFileExtension = fileExt(userFilename);
  if (userFilename) {
      // user renames the file
      if (isValidFileExtension(userFileExtension)) {
          // also test that users name is sensible
          if (userFileExtension != uploadFileExtension) {
              showErrorMsg('#admin-user-filename-error-msg', 'Filename provided is not acceptable.');
              e.preventDefault();
          } else {
              // set hidden field value
              $("#admin-main-upload-file-type").val(userFileExtension);
          }
      } else {
          // the user filename is invalid
          showErrorMsg('#admin-user-filename-error-msg', 'Filename provided is not acceptable.');
          e.preventDefault();
      }
  }

  // console.log(form[0]);
  // for (each of Object.keys(form[0])) {
  //     console.log(each);
  // }

  formdata = new FormData(form[0]);
  console.log(formdata);
  var formAction = form.attr('action');
  $.ajax({
      type: "POST",
      url: "/admin-uploadfile",
      data: formdata
          ? formdata
          : form.serialize(),
      processData: false,
      contentType: false,
      success: success
  });

  function success(data) {
      console.log('success');
      console.log(data);
      $('#admin-upload-file-error-msg').val('File uploaded successfully');
  }
  console.log('the end')
})
