/**
 * @class Date utility.
 */
function DateUtil () {
};
/**
 * @param {Date} date
 * @param future
 * @param today
 * @param past
 * @returns future, today or past
 */
DateUtil.futureOrPast = function (date, future, today, past) {
	var normalizedDate = new Date(date);
	var normalizedToday = new Date();
	normalizedDate.setHours(0, 0, 0, 0);
	normalizedToday.setHours(0, 0, 0, 0);
	if (normalizedDate > normalizedToday) {
		return future;
	}
	else if (normalizedDate < normalizedToday) {
		return past;
	}
	return today;
};
/**
 * @param {Date} date
 * @returns {Number} time in UTC
 */
DateUtil.getUTCTime = function (date) {
	return date.getTime() - date.getTimezoneOffset() * 60 * 1000;
};
/**
 * Get time or zero if null.
 * @param {Date} date
 * @returns {Number}
 */
DateUtil.getTimeOrZero = function (date) {
	if (date && date.getTime) {
		return date.getTime();
	}
	return 0;
};
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
if (typeof localStorage == undefined) {
	localStorage = new NullStorage();
}
if (typeof sessionStorage == undefined) {
	sessionStorage = new NullStorage();
}
/**
 * @class Request utility.
 */
function RequestUtil () {
};
/**
 * Parse query string.
 * @returns hash of query parameters
 * @see http://code.google.com/intl/ja/apis/accounts/docs/OAuth2UserAgent.html
 */
RequestUtil.getQueryParameters = function () {
	var params = {};
	var queryString = window.location.search.substring(1);
	var regex = /([^&=]+)=([^&]*)/g;
	var m;
	while (m = regex.exec(queryString)) {
		params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
	}
	return params;
};