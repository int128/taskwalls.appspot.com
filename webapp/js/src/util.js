/**
 * @class Application settings.
 */
function AppSettingsViewModel () {
	/**
	 * Normalized date of today.
	 */
	this.today = ko.computed(function () {
		return DateUtil.normalize(new Date());
	});
	/**
	 * Last cached date.
	 */
	this.lastCached = ko.computed({
		read: function () {
			return new Date(parseInt(localStorage['cachedDate']));
		},
		write: function (value) {
			localStorage['cachedDate'] = value.getTime();
		}
	});
	/**
	 * Offline mode.
	 */
	this.offline = ko.computed({
		read: function () {
			return sessionStorage['session-offline'] == 'true';
		},
		write: function (value) {
			if (value) {
				sessionStorage['session-offline'] = true;
			}
			else {
				sessionStorage.removeItem('session-offline');
			}
		}
	});
};
/**
 * Number of colors.
 */
AppSettingsViewModel.prototype.tasklistColors = 24;
/**
 * @class Date utility.
 */
function DateUtil () {
};
/**
 * Normalize date. Hours, minutes and seconds will be 0.
 * @param {Number} or {Date} time
 * @returns {Date}
 */
DateUtil.normalize = function (time) {
	var normalized = new Date(time);
	normalized.setHours(0, 0, 0, 0);
	return normalized;
};
/**
 * Returns true if the day is in this week.
 * This function assumes a week begins from Monday.
 * @param {Date} date
 * @returns {Boolean}
 */
DateUtil.isThisWeek = function (time) {
	var today = new Date();
	today.setHours(0, 0, 0, 0);
	var first = today.getTime() - ((today.getDay() + 6) % 7) * 24 * 3600 * 1000;
	var next = first + 7 * 24 * 3600 * 1000;
	return first <= time && time < next;
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
if (typeof localStorage === undefined) {
	window.localStorage = new NullStorage();
}
if (typeof sessionStorage === undefined) {
	window.sessionStorage = new NullStorage();
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