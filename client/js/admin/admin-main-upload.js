$('#admin-upload-form').submit((e) => {
    // before submit we need to have
    // 1. an attached file
    // 2. an attached file with a valid (image or markdown) extension
    // 3. if the user renames the file, is the new user designated filename valid
    // 3b. does the user filename have a valid extension
    // 4. if not show an error message and don't submit
    // 5. else
    // 6. set input file-type to value img or md

    console.log('submit');


    function fileExt(string) {
        // return file extension
        // abc.def returns 'def'
        if (string.indexOf('.') < 0) {
            return '';
        }
        return string.split('.')[1].toUpperCase();
    }

    function isValidFileExtension(fileExtension) {
        if (extToTest.hasOwnProperty(fileExtension))
                return true;
        return false;
    }

    function showErrorMsg(selector, text) {
        $(selector).text(text);
        setTimeout(() => {
            $(id).text('');
        },2000);
    }

    var extToTest = {
        MD: 'md',
        JPEG: 'img',
        JPG: 'img',
        PNG: 'img',
        GIFF: 'img',
    };


    // is file to upload valid
    var uploadFile = $('#admin-main-upload-file').val();
    uploadFile = (uploadFile) ? uploadFile.split('\\')[2] : ''     // extract filename
    var uploadFileExtension = fileExt(uploadFile)
    console.log('uploadFile: ' + uploadFile);
    console.log('fileExtension: ' + uploadFileExtension);
    if isValidFileExtension(uploadFileEtension) {
        // set hidden field file-type
        console.log('aaa');
        console.log(uploadFile);
        console.log(uploadFileExtension);
        console.log($("#admin-main-upload-file-type"));
        $("#admin-main-upload-file-type").val(uploadFileExtension);
    }
    else {
        // the attached file is invalid
        console.log('file filename is invalid');
        showErrorMsg('#admin-upload-file-error-msg','File not accepted.');
        e.preventDefault();
    }

    // user filename
    var userFilename = $('#admin-main-upload-user-filename').val();
    var userFileExtension = fileExt(userFilename);
    if (userFilename) {
        // user renames the file
        consol.log('userFilename');
        if (isValidFileExtension(userFileExtension)) {
            // also test that users name is sensible
            if (userFileExtension != uploadFileExtension) {
                showErrorMsg('#admin-user-filename-error-msg', 'Filename provided is not acceptable.');
                e.preventDefault();
            }
            else {
                console.log('bbb');
                // set hidden field value
                $("#admin-main-upload-file-type").val(userFileExtension);
            }
        }
        else {
            // the user filename is invalid
            console.log('user filename is invalid');
            showErrorMsg('#admin-user-filename-error-msg', 'Filename provided is not acceptable.');
            e.preventDefault();
        }
    }
    // $("#admin-main-upload-file-type").val('img');
    console.log('the end')
})
