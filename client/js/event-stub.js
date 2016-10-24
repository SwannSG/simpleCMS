// even-stub.js

var event_stub = {};

// function is called from html
event_stub.moreInfo = (partFilename) => {
  // partFilename has form 'even-stub-n' where n = 1,2,3,4,5
  var eventNum = partFilename[partFilename.length - 1];
  // we may want to simplify this by sending htmlDocName direct from the server
  var htmlDocName = 'event-' + eventNum + '.html';
  $('#main').load('html/user/' + htmlDocName);
};

event_stub.book = (arg) => {
  // request formS from server
  $.ajax({
      url: '/event-3-json',
      type: 'GET',
      contentType: 'application/json',
    })
    .done((data) => {
      // substitute variable values into htmlSnippet
      for (var key in data.dummy) {
        data.htmlSnippet = data.htmlSnippet.replace('%%' + key + '%%', data.dummy[key]);
      }
      $('#main').html(data.htmlSnippet);
    })
    .fail((err) => {
      console.log(err);
    });
};
