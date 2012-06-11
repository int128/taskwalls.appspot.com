/**
 * @class Application settings.
 */
function AppSettingsViewModel () {
	this.initialize.apply(this, arguments);
}
/**
 * @constructor {@link AppSettingsViewModel}
 */
AppSettingsViewModel.prototype.initialize = function () {
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