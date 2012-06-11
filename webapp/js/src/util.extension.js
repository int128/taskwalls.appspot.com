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
/*
 * Array#reduce(function(previousValue, currentValue, index, array))
 * https://developer.mozilla.org/ja/Core_JavaScript_1.5_Reference/Objects/Array/reduce
 */
if (!Array.prototype.reduce) {
  Array.prototype.reduce = function reduce(accumulator){
    if (this===null || this===undefined) throw new TypeError("Object is null or undefined");

    var i = 0, l = this.length >> 0, curr;

    if(typeof accumulator !== "function") // ES5 : "If IsCallable(callbackfn) is false, throw a TypeError exception."
      throw new TypeError("First argument is not callable");

    if(arguments.length < 2) {
      if (l === 0) throw new TypeError("Array length is 0 and no second argument");
      curr = this[0];
      i = 1; // start accumulating at the second element
    }
    else
      curr = arguments[1];

    while (i < l) {
      if(i in this) curr = accumulator.call(undefined, curr, this[i], i, this);
      ++i;
    }

    return curr;
  };
}
$.extend({
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
	}
});
