$(document).ready(function() {
    $('#uploadForm').submit(function(event) {
        console.log('submit #uploadForm');
        event.preventDefault();
        $.ajax({
            url: '/uploadfile',
            type: 'POST',
            data: new FormData(this),
            contentType: false,
            processData: false,
            success: function(data) {
                console.log('File loaded ok');
            },
            error: function(err) {
                console.log(err);
            }
        })
    }); //end #uploadForm
});
