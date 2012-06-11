/**
 * @class Application settings.
 */
function AppSettingsViewModel () {
	this.initialize.apply(this, arguments);
}
/**
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
