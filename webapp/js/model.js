/**
 * @class represents tasklists model
 * @param {Array} items array of tasklist
 */
function Tasklists (items) {
	this.items = items;
};
/**
 * Get {@link Tasklists} from server.
 * @param {Function} callback async callback function
 */
Tasklists.get = function (callback) {
	$.getJSON('/tasklists/list', null, function (response) {
		var instance = new Tasklists(response.items);
		$.each(instance.items, function (i, tasklist) {
			if (tasklist.colorID == undefined) {
				// auto generate
				// FIXME: must generate by server
				var pattern = [3, 11, 9, 15];
				tasklist.colorID = pattern[i % pattern.length];
			}
		});
		if ($.isFunction(callback)) {
			callback(instance);
		}
	});
};
/**
 * Update the tasklist options.
 * @param {Object} tasklist tasklist JSON
 * @param {Function} success
 * @param {Function} error
 */
Tasklists.updateOptions = function (tasklist, success, error) {
	$.ajax({
		type: 'POST',
		url: '/tasklists/options/update',
		data: tasklist,
		dataType: 'json',
		success: success,
		error: error
	});
};
/**
 * Get item by tasklist ID.
 * @param {String} tasklistID
 * @returns {Object} tasklist JSON (empty hash if not found)
 */
Tasklists.prototype.getByID = function (tasklistID) {
	var result = {};
	$.each(this.items, function (i, tasklist) {
		if (tasklist.id == tasklistID) {
			result = tasklist;
			return false;
		}
	});
	return result;
};
/**
 * @class represents tasks model
 * @param {Array} items
 * @property {Array} items
 */
function Tasks (items) {
	this.items = items;
};
/**
 * Get tasks from server.
 * @param {String} tasklistID task list ID
 * @param {Function} callback async callback function
 */
Tasks.get = function (tasklistID, callback) {
	$.getJSON('/tasks/list', {tasklistID: tasklistID}, function (response) {
		var instance = new Tasks(response.items);
		if ($.isFunction(callback)) {
			callback(instance);
		}
	});
};
/**
 * @returns latest date time in milliseconds
 */
Tasks.prototype.latestTime = function () {
	if (this.items.length == 0) {
		return new Date().getTime();
	}
	return Math.max.apply(null, $.map(this.items, function (task) {
		return task.dueTime;
	}));
};
/**
 * @returns earliest date time in milliseconds
 */
Tasks.prototype.earliestTime = function () {
	if (this.items.length == 0) {
		return new Date().getTime();
	}
	return Math.min.apply(null, $.map(this.items, function (task) {
		return task.dueTime;
	}));
};
/**
 * Get array of date from earliest to latest date in tasks.
 * @param {Number} marginDays
 * @returns {Array} array of {@link Date}
 */
Tasks.prototype.days = function (marginDays) {
	if (marginDays == undefined) {
		marginDays = 0;
	}
	var minTime = this.earliestTime() - marginDays * 86400000;
	var maxTime = this.latestTime() + marginDays * 86400000;
	var result = [];
	for (var time = minTime; time <= maxTime; time += 86400000) {
		result.push(new Date(time));
	}
	return result;
};