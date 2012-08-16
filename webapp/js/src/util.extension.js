/**
 * Get hash code of {@link String}.
 * @returns {Number} hash code
 * @see http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
 */
String.prototype.hashCode = function () {
	var h = 0;
	if (this.length == 0) {
		return h;
	}
	for (var i = 0; i < this.length; i++) {
		var c = this.charCodeAt(i);
		h = ((h<<5)-h)+c;
		h = h & h; // Convert to 32bit integer
	}
	return h;
};
/**
 * @class null implementation of web storage
 * @returns {NullStorage}
 */
function NullStorage () {
	this.length = 0;
}
NullStorage.prototype.key = function () {};
NullStorage.prototype.getItem = function () {};
NullStorage.prototype.setItem = function () {};
NullStorage.prototype.removeItem = function () {};
NullStorage.prototype.clear = function () {};
if (typeof localStorage === undefined) {
	window.localStorage = new NullStorage();
}
if (typeof sessionStorage === undefined) {
	window.sessionStorage = new NullStorage();
}
// jQuery extentions
$.extend({
	/**
	 * Get resource from document.
	 * @param {String} key
	 * @returns {String}
	 */
	resource: function (key) {
		return $('#resources>[data-key="' + key + '"]').text();
	},
	/**
	 * Parse query string.
	 * @returns hash of query parameters
	 * @see http://code.google.com/intl/ja/apis/accounts/docs/OAuth2UserAgent.html
	 */
	queryParameters: function () {
		var params = {};
		var queryString = window.location.search.substring(1);
		var regex = /([^&=]+)=([^&]*)/g;
		var m;
		while (m = regex.exec(queryString)) {
			params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
		}
		return params;
	},
	/**
	 * Always return true.
	 * @returns {Boolean}
	 */
	noopTrue: function () {
		return true;
	},
	/**
	 * Always return false.
	 * @returns {Boolean}
	 */
	noopFalse: function () {
		return false;
	}
});
// bootstrap extensions
$(function () {
	$(document).tooltip({
		selector: '.showtooltip'
	});
});
