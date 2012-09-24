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

// ECMAScript5 extensions
// see http://kangax.github.com/es5-compat-table/

// for FF -3.6, Safari -5.1
// https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function/bind
if (!Function.prototype.bind) {
	Function.prototype.bind = function (oThis) {
		if (typeof this !== "function") {
			// closest thing possible to the ECMAScript 5 internal IsCallable function
			throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
		}

		var aArgs = Array.prototype.slice.call(arguments, 1), fToBind = this, fNOP = function () {
		}, fBound = function () {
			return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice
					.call(arguments)));
		};

		fNOP.prototype = this.prototype;
		fBound.prototype = new fNOP();

		return fBound;
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

(function () {
	// see https://github.com/jquery/jquery/blob/master/src/ajax.js
	var ajaxMethod = function (method, contentType, url, data, callback, type) {
		// shift arguments if data argument was omitted
		if (jQuery.isFunction(data)) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jQuery.ajax({
			type: method,
			contentType: contentType,
			url: url,
			data: data,
			success: callback,
			dataType: type
		});
	};
	$.postJSON = ajaxMethod.bind(null, 'POST', 'application/json; charset=UTF-8');
	$.putJSON = ajaxMethod.bind(null, 'PUT', 'application/json; charset=UTF-8');
	$.deleteEncoded = ajaxMethod.bind(null, 'DELETE', undefined);
})();

// bootstrap extensions
$(function () {
	$(document).tooltip({
		selector: '.showtooltip'
	});
});
