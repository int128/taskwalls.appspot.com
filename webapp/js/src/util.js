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
function DateUtil () {};
DateUtil.prototype = {};
/**
 * Normalize date.
 * Result is an new instance.
 * @param {Date} date (also accepts {Number})
 * @returns {Date} new instance
 */
DateUtil.normalize = function (date) {
	var normalized = new Date(date);
	normalized.setHours(0, 0, 0, 0);
	return normalized;
};
/**
 * Determine if given days are in same week.
 * This function assumes a week begins from Monday.
 * @param {Date} day1 (also accepts {Number})
 * @param {Date} day2 (also accepts {Number})
 * @returns {Boolean} true if they are in same week
 */
DateUtil.areSameWeek = function (day1, day2) {
	return DateUtil.calculateFirstDayOfWeek(day1).getTime()
		== DateUtil.calculateFirstDayOfWeek(day2).getTime();
};
/**
 * Return first day of the week.
 * This function assumes a week begins from Monday.
 * @param {Date} day (also accepts {Number})
 * @returns {Date} first day of the week (new instance)
 */
DateUtil.calculateFirstDayOfWeek = function (day) {
	var firstDay = new Date(day);
	firstDay.setHours(0, 0, 0, 0);
	firstDay.setDate(firstDay.getDate() - (firstDay.getDay() + 6) % 7);
	return firstDay;
};
/**
 * Get UTC time of same date and time in local zone.
 * @returns {Number} time in UTC
 */
Date.prototype.getUTCTime = function () {
	return this.getTime() - this.getTimezoneOffset() * 60 * 1000;
};
/**
 * Return first day of the week.
 * @returns {Date} first day (new instance)
 * @deprecated
 */
Date.prototype.getFirstDayOfWeek = function () {
	return DateUtil.calculateFirstDayOfWeek(this);
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
