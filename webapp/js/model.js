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
	$.getJSON('tasklists/list', null, function (response) {
		var instance = new Tasklists(response.items);
		$.each(instance.items, function (i, tasklist) {
			if (tasklist.colorID == undefined) {
				tasklist.colorID = i % Constants.tasklistColors;
			}
		});
		if ($.isFunction(callback)) {
			callback(instance);
		}
	});
};
/**
 * Update color of the tasklist.
 * @param tasklist JSON tasklist
 * @param {Function} callback
 */
Tasklists.updateColor = function (tasklist, callback) {
	$.post('tasklists/options/update', tasklist);
};
/**
 * @class represents tasks model
 * @param {String} tasklistID task list ID
 * @param {Array} items
 * @property {String} tasklistID task list ID
 * @property {Array} items
 */
function Tasks (tasklistID, items) {
	this.tasklistID = tasklistID;
	this.items = items;
};
/**
 * Get tasks from server.
 * @param {String} tasklistID task list ID
 * @param {Function} callback async callback function
 */
Tasks.get = function (tasklistID, callback) {
	$.getJSON('tasks/list', {tasklistID: tasklistID}, function (response) {
		var instance = new Tasks(tasklistID, response.items);
		if ($.isFunction(callback)) {
			callback(instance);
		}
	});
};
/**
 * Update status of task.
 * @param task JSON task
 * @param {Function} success
 * @param {Function} error
 */
Tasks.updateStatus = function (task, success, error) {
	$.ajax({
		type: 'POST',
		url: 'tasks/update/status',
		data: task,
		dataType: 'json',
		success: success,
		error: error
	});
};
/**
 * Update title of task.
 * @param task JSON task
 * @param {Function} success
 * @param {Function} error
 */
Tasks.updateTitle = function (task, success, error) {
	$.ajax({
		type: 'POST',
		url: 'tasks/update/title',
		data: task,
		dataType: 'json',
		success: success,
		error: error
	});
};
/**
 * Update title of task.
 * @param task JSON task
 * @param {Function} success
 * @param {Function} error
 */
Tasks.updateDueTime = function (task, success, error) {
	$.ajax({
		type: 'POST',
		url: 'tasks/update/dueTime',
		data: task,
		dataType: 'json',
		success: success,
		error: error
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