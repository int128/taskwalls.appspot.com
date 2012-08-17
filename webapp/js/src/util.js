/**
 * @class simple request router
 */
function LocationHashRouter () {};
LocationHashRouter.prototype = {};
/**
 * route by given rules
 * @param {Object} rules map of hash and function
 */
LocationHashRouter.route = function (rules) {
	var func = rules[location.hash];
	if ($.isFunction(func)) {
		func.call();
	} else {
		rules['default'].call();
	}
};
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
 * Return first day of the week.
 * @param {Date} day (also accepts {Number})
 * @returns {Date} first day of the month (new instance)
 */
DateUtil.calculateFirstDayOfMonth = function (day) {
	var firstDay = new Date(day);
	firstDay.setHours(0, 0, 0, 0);
	firstDay.setDate(1);
	return firstDay;
};
/**
 * Return UTC time of same date and time in local zone.
 * For example, if parameter is (10:00 AM JST) then returns (10:00 AM UTC). 
 * @param {Number} time local time
 * @returns {Number} time UTC time
 */
DateUtil.calculateTimeInUTC = function (time) {
	return time - new Date(time).getTimezoneOffset() * 60 * 1000;
};
