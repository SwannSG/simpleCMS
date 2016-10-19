// even-stub.js

var event_stub = {};

event_stub.moreInfo = (partFilename) => {
  // partFilename has form 'even-stub-n' where n = 1,2,3,4,5
  var eventNum = partFilename[partFilename.length - 1];
  // we may want to simplify this by sending htmlDocName direct from the server
  var htmlDocName = 'event-' + eventNum + '.html';
  $('#main').load('html/user/' + htmlDocName);
};
