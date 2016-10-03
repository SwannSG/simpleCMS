$( document ).ready(function() {
    $('#sendJSON').click((e) => {
        e.preventDefault()
        console.log("#sendJSON");
        var obj = {a:'a', b:'b'};
        $.ajax({
            url: "/rest/jsonData",
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(obj)
        })
            .done(function (data) {
                // Handle good response
                console.log(data); 

            })
            .fail(function (err) {
                // Handle bad response
            });
    });
});
