/**
 * @class Application settings.
 */
function AppSettings () {
	this.initialize.apply(this, arguments);
}
/**
 */
AppSettings.prototype.initialize = function () {
	/**
	 * Normalized date of today.
	 */
	this.today = ko.observable(DateUtil.normalize(new Date()));
	/**
	 * Last cached date.
	 */
	this.lastCached = ko.observable(new Date(parseInt(localStorage['cachedDate'])));
	ko.computed(function () {
		localStorage['cachedDate'] = this.lastCached().getTime();
	}, this);
	/**
	 * Offline mode.
	 */
	this.offline = ko.observable(sessionStorage['offline'] == 'true');
	ko.computed(function () {
		sessionStorage['offline'] = this.offline();
	}, this);
	/**
	 * Development environment.
	 */
	this.development = ko.observable(location.hostname.search('.appspot.com') == -1);
};
/**
 * Number of colors.
 */
AppSettings.prototype.tasklistColors = 24;
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
 * Get time-stamp in UTC.
 * @returns {Number} time in UTC
 */
Date.prototype.getUTCTime = function () {
	return this.getTime() - this.getTimezoneOffset() * 60 * 1000;
};
/**
 * Return first day of the week.
 * @returns {Date} first day (new instance)
 */
Date.prototype.getFirstDayOfWeek = function () {
	var day = new Date(this);
	day.setDate(day.getDate() - (day.getDay() + 6) % 7);
	return day;
};
/**
 * Return first day of the month.
 * @returns {Date} first day (new instance)
 */
Date.prototype.getFirstDayOfMonth = function () {
	var day = new Date(this);
	day.setDate(1);
	return day;
};
