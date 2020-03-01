/*
 jQuery AJAX Cross Origin v1.3 (http://www.ajax-cross-origin.com) 
 jQuery plugin to bypass Same-origin_policy using Google Apps Script. 
 
 references:
 http://en.wikipedia.org/wiki/Same-origin_policy
 http://www.google.com/script/start/
 
 (c) 2014, Writen by Erez Ninio. site: www.dealhotelbook.com
 
 Licensed under the Creative Commons Attribution 3.0 Unported License. 
 For details, see http://creativecommons.org/licenses/by/3.0/.
*/

var proxyJsonp = "https://script.google.com/macros/s/AKfycbwmqG55tt2d2FcT_WQ3WjCSKmtyFpkOcdprSITn45-4UgVJnzp9/exec";
//proxyJsonp = "https://script.google.com/macros/s/AKfycbzZTxXGt35vf2sISnefUTMRFy1h5iVsrl03wAjyiQ0q/dev";  //test script

jQuery.ajaxOrig = jQuery.ajax;

jQuery.ajax = function(url, options){
	var o = ( typeof url === "object" ) ? url : (options || {});
	o.url = (o.url || (( typeof url === "string" ) ? url : ''));
	o = jQuery.ajaxSetup( {}, o );
	var is_co = useCrossOrigin(o.url, o);
	if(o.proxy && o.proxy.length>0) {
		proxyJsonp = o.proxy;
		if ( typeof url === "object" ) url.crossDomain = true;
		else if ( typeof options === "object" ) options.crossDomain = true;
	}
	
	if(is_co){
		//change the URL
		if ( typeof url === "object" ) {
			if(url.url) {
				url.url = getProxyURL(url.url);
				if(url.charset) url.url += '&charset='+url.charset;
				url.dataType = "json";
			}
		}else if ( typeof url === "string" && typeof options === "object" ){
			url = getProxyURL(url);
			if(options.charset) url += '&charset='+options.charset;
			options.dataType = "json";
		}
	}

	// Call super constructor.
	return jQuery.ajaxOrig.apply( this, arguments );
	
	function useCrossOrigin(url, options){
		var parser = document.createElement('a');
		parser.href = url;
		return (options.crossOrigin && url.substr(0, 4).toLowerCase() == 'http' && parser.hostname != 'localhost' && parser.hostname != '127.0.0.1' && parser.hostname != window.location.hostname);
	}

	function getProxyURL(url){
		var url = encodeURI(url).replace(/&/g, "%26");
		return proxyJsonp + "?url=" + url + "&callback=?";
	}
}

jQuery.ajax.prototype = new jQuery.ajaxOrig();
jQuery.ajax.prototype.constructor = jQuery.ajax;
