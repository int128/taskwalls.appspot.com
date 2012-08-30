/**
 * Get hash code of {@link String}.
 * 
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
		h = ((h << 5) - h) + c;
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
NullStorage.prototype.key = function () {
};
NullStorage.prototype.getItem = function () {
};
NullStorage.prototype.setItem = function () {
};
NullStorage.prototype.removeItem = function () {
};
NullStorage.prototype.clear = function () {
};

if (typeof localStorage === undefined) {
	window.localStorage = new NullStorage();
}
if (typeof sessionStorage === undefined) {
	window.sessionStorage = new NullStorage();
}

//
// array extensions
//

// https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/indexOf
if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function (searchElement /* , fromIndex */) {
		"use strict";
		if (this == null) {
			throw new TypeError();
		}
		var t = Object(this);
		var len = t.length >>> 0;
		if (len === 0) {
			return -1;
		}
		var n = 0;
		if (arguments.length > 0) {
			n = Number(arguments[1]);
			if (n != n) { // shortcut for verifying if it's NaN
				n = 0;
			} else if (n != 0 && n != Infinity && n != -Infinity) {
				n = (n > 0 || -1) * Math.floor(Math.abs(n));
			}
		}
		if (n >= len) {
			return -1;
		}
		var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
		for (; k < len; k++) {
			if (k in t && t[k] === searchElement) {
				return k;
			}
		}
		return -1;
	};
}

// https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/filter
if (!Array.prototype.filter) {
	Array.prototype.filter = function (fun /* , thisp */) {
		"use strict";

		if (this == null)
			throw new TypeError();

		var t = Object(this);
		var len = t.length >>> 0;
		if (typeof fun != "function")
			throw new TypeError();

		var res = [];
		var thisp = arguments[1];
		for ( var i = 0; i < len; i++) {
			if (i in t) {
				var val = t[i]; // in case fun mutates this
				if (fun.call(thisp, val, i, t))
					res.push(val);
			}
		}

		return res;
	};
}

// https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/every
if (!Array.prototype.every) {
	Array.prototype.every = function (fun /* , thisp */) {
		"use strict";

		if (this == null)
			throw new TypeError();

		var t = Object(this);
		var len = t.length >>> 0;
		if (typeof fun != "function")
			throw new TypeError();

		var thisp = arguments[1];
		for ( var i = 0; i < len; i++) {
			if (i in t && !fun.call(thisp, t[i], i, t))
				return false;
		}

		return true;
	};
}

// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.com/#x15.4.4.19
if (!Array.prototype.map) {
	// https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/map
	Array.prototype.map = function (callback, thisArg) {

		var T = undefined, A, k;

		if (this == null) {
			throw new TypeError(" this is null or not defined");
		}

		// 1. Let O be the result of calling ToObject passing the |this| value as the argument.
		var O = Object(this);

		// 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
		// 3. Let len be ToUint32(lenValue).
		var len = O.length >>> 0;

		// 4. If IsCallable(callback) is false, throw a TypeError exception.
		// See: http://es5.github.com/#x9.11
		if ({}.toString.call(callback) != "[object Function]") {
			throw new TypeError(callback + " is not a function");
		}

		// 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
		if (thisArg) {
			T = thisArg;
		}

		// 6. Let A be a new array created as if by the expression new Array(len) where Array is
		// the standard built-in constructor with that name and len is the value of len.
		A = new Array(len);

		// 7. Let k be 0
		k = 0;

		// 8. Repeat, while k < len
		while (k < len) {

			var kValue, mappedValue;

			// a. Let Pk be ToString(k).
			// This is implicit for LHS operands of the in operator
			// b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
			// This step can be combined with c
			// c. If kPresent is true, then
			if (k in O) {

				// i. Let kValue be the result of calling the Get internal method of O with argument Pk.
				kValue = O[k];

				// ii. Let mappedValue be the result of calling the Call internal method of callback
				// with T as the this value and argument list containing kValue, k, and O.
				mappedValue = callback.call(T, kValue, k, O);

				// iii. Call the DefineOwnProperty internal method of A with arguments
				// Pk, Property Descriptor {Value: mappedValue, : true, Enumerable: true, Configurable: true},
				// and false.

				// In browsers that support Object.defineProperty, use the following:
				// Object.defineProperty(A, Pk, { value: mappedValue, writable: true, enumerable: true, configurable:
				// true });

				// For best browser support, use the following:
				A[k] = mappedValue;
			}
			// d. Increase k by 1.
			k++;
		}

		// 9. return A
		return A;
	};
}

// https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/Reduce
if (!Array.prototype.reduce) {
	Array.prototype.reduce = function reduce (accumulator) {
		if (this === null || this === undefined)
			throw new TypeError("Object is null or undefined");
		var i = 0, l = this.length >> 0, curr;

		if (typeof accumulator !== "function")
			// ES5 : "If IsCallable(callbackfn) is false, throw a TypeError exception."
			throw new TypeError("First argument is not callable");

		if (arguments.length < 2) {
			if (l === 0)
				throw new TypeError("Array length is 0 and no second argument");
			curr = this[0];
			i = 1; // start accumulating at the second element
		} else
			curr = arguments[1];

		while (i < l) {
			if (i in this)
				curr = accumulator.call(undefined, curr, this[i], i, this);
			++i;
		}

		return curr;
	};
}

// jQuery extentions
$.extend({
	/**
	 * Get resource from document.
	 * 
	 * @param {String}
	 *            key
	 * @returns {String}
	 */
	resource: function (key) {
		return $('#resources>[data-key="' + key + '"]').text();
	},

	/**
	 * Parse query string.
	 * 
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
	 * 
	 * @returns {Boolean}
	 */
	noopTrue: function () {
		return true;
	},

	/**
	 * Always return false.
	 * 
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
