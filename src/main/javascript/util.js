/**
 * @class Date utility.
 */
function DateUtil () {
};
DateUtil.prototype = {};
DateUtil.DAY_UNIT = 24 * 60 * 60 * 1000;
DateUtil.WEEK_UNIT = 7 * 24 * 60 * 60 * 1000;

/**
 * Clear time part of the date.
 * 
 * @param {Date}
 *            date
 * @returns {Date} instance as-is
 */
DateUtil.clearTimePart = function (date) {
	date.setHours(0, 0, 0, 0);
	return date;
};

/**
 * Generate array of days.
 * 
 * @param {Number}
 *            origin time of the first element
 * @param {Number}
 *            count number of elements
 * @param {Function}
 *            f generator of each element, function ({Number} time)
 * @returns {Array}
 */
DateUtil.arrayOfDays = function (origin, count, f) {
	var a = [], time = origin;
	for ( var i = 0; i < count; i++) {
		a[i] = f(time);
		time += DateUtil.DAY_UNIT;
	}
	return a;
};

/**
 * Generate array of weeks.
 * 
 * @param {Number}
 *            origin time of the first element
 * @param {Number}
 *            count number of elements
 * @param {Function}
 *            f generator of each element, function ({Number} time)
 * @returns {Array}
 */
DateUtil.arrayOfWeeks = function (origin, count, f) {
	var a = [], time = origin;
	for ( var i = 0; i < count; i++) {
		a[i] = f(time);
		time += DateUtil.WEEK_UNIT;
	}
	return a;
};

/**
 * Generate array of months.
 * 
 * @param {Number}
 *            origin time of the first element
 * @param {Number}
 *            count number of elements
 * @param {Function}
 *            f generator of each element, function ({Number} thisMonth, {Number} nextMonth)
 * @returns {Array}
 */
DateUtil.arrayOfMonths = function (origin, count, f) {
	var a = [], day = new Date(origin);
	for ( var i = 0; i < count; i++) {
		var thisMonth = day.getTime();
		day.setMonth(day.getMonth() + 1);
		var nextMonth = day.getTime();
		a[i] = f(thisMonth, nextMonth);
	}
	return a;
};

/**
 * Return first day of the week. This function assumes a week begins from Monday.
 * 
 * @param {Date}
 *            day (also accepts {Number})
 * @returns {Date} first day of the week (new instance)
 */
DateUtil.calculateFirstDayOfWeek = function (day) {
	var firstDay = new Date(day);
	firstDay.setHours(0, 0, 0, 0);
	firstDay.setDate(firstDay.getDate() - (firstDay.getDay() + 6) % 7);
	return firstDay;
};

/**
 * Return first day of the month.
 * 
 * @param {Date}
 *            day (also accepts {Number})
 * @returns {Date} first day of the month (new instance)
 */
DateUtil.calculateFirstDayOfMonth = function (day) {
	var firstDay = new Date(day);
	firstDay.setHours(0, 0, 0, 0);
	firstDay.setDate(1);
	return firstDay;
};

/**
 * Return UTC time of same date and time in local zone. For example, if parameter is (10:00 AM JST) then returns (10:00
 * AM UTC).
 * 
 * @param {Number}
 *            time local time
 * @returns {Number} time UTC time
 */
DateUtil.calculateTimeInUTC = function (time) {
	return time - new Date(time).getTimezoneOffset() * 60 * 1000;
};

/**
 * Today. This is an observable value, updated at 0:00.
 * 
 * @returns {Number} today
 */
DateUtil.today = ko.observable();
(function () {
	/**
	 * Calculate remaining time until 0:00.
	 * 
	 * @returns {Number} time in milliseconds
	 */
	function calculateTimeUntilDateChanges () {
		var tomorrow = DateUtil.clearTimePart(new Date());
		tomorrow.setDate(tomorrow.getDate() + 1);
		return tomorrow.getTime() - $.now();
	}
	/**
	 * Update DateUtil#today.
	 */
	function update () {
		DateUtil.today(DateUtil.clearTimePart(new Date()).getTime());
		setTimeout(update, calculateTimeUntilDateChanges());
	}
	// initialize at first time
	update();
})();

/**
 * First day of this week. This function assumes a week begins from Monday.
 * 
 * @returns {Number}
 */
DateUtil.thisWeek = ko.computed(function () {
	return DateUtil.calculateFirstDayOfWeek(DateUtil.today()).getTime();
});

/**
 * First day of this month.
 * 
 * @returns {Number}
 */
DateUtil.thisMonth = ko.computed(function () {
	return DateUtil.calculateFirstDayOfMonth(DateUtil.today()).getTime();
});

/**
 * @class function utility
 */
function FunctionUtil () {
};
FunctionUtil.prototype = {};

/**
 * Generate a function that executes given functions sequentially.
 * 
 * @param {Function}
 *            f
 * @param {Function}
 *            g
 * @returns {Function}
 */
FunctionUtil.seq = function (f, g) {
	return function () {
		f.apply(this, arguments);
		return g.apply(this, arguments);
	};
};

/**
 * Generate a match function. 
 * 
 * <code><pre>
 * var value = 100;
 * var f = FunctionUtil.match(function () {
 * 	return value;
 * });
 * 
 * f(100); // -&gt; true
 * f(50, 200); // -&gt; false
 * 
 * value = 50;
 * f(100); // -&gt; false
 * f(50, 200); // -&gt; true
 * </pre></code>
 * 
 * @param {Function}
 *            v value function
 * @returns {Function}
 */
FunctionUtil.match = function (v) {
	return function () {
		return Array.prototype.slice.call(arguments).indexOf(v.call()) != -1;
	};
};
