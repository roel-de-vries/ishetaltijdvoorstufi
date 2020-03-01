/** @description
 * using Google Apps Script as a proxy jSON getter where jSONP is not implemented 
 */

/**
 * execute e.url and wrap up as jSONp for e.callback
 * @param {object} e the event parameters
 * @return {String} the jSONp response
 */
function doGet(e) {
    return ContentService
            .createTextOutput(urlGet(e))
              .setMimeType(ContentService.MimeType.JAVASCRIPT);  

}

function urlGet(e) {
  var results = null;
  
  if (e.parameter.url) {
    var url = encodeURI( decodeURIComponent(e.parameter.url) );
    var charset = null;
    if (e.parameter.charset) charset = e.parameter.charset;
    var response = UrlFetchApp.fetch( url ).getContentText(charset);
    if (response) results = response;
  }
  
  //var j = Utilities.jsonStringify(results);	//Deprecated
  var j = JSON.stringify(results);

  if (e.parameter.callback) {
      j = e.parameter.callback + "(" + j + ")"
  }
  
  return j;
}

function testUrlGet() {
  Logger.log(urlGet ({parameter: {url: encodeURIComponent("http://headers.jsontest.com/"), callback: 'xyz' }}));
}
