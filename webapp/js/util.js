/**
 * @class DateUtil
 */
var DateUtil = {};
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
 * @class form utility
 */
var FormUtil = {};
/**
 * Convert name-value array to hash object.
 * @param {Array} nameValueMap
 * @returns {Object}
 */
FormUtil.nameValueToHash = function (nameValueMap) {
	var result = {};
	$.each(nameValueMap, function (i, entry) {
		result[entry.name] = entry.value;
	});
	return result;
};
