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
	$.ajax({
		url: '/tasklists/list',
		dataType: 'json',
		success: function (response) {
			if ($.isArray(response.items)) {
				if ($.isFunction(callback)) {
					callback(Tasklists.createFromJson(response.items));
				}
			}
			else {
				currentOAuth2Session.authorize();
			}
		}
	});
};
/**
 * Create an instance from JSON.
 * @param {Array} items JSON array
 * @returns {Tasklists}
 */
Tasklists.createFromJson = function (items) {
	$.each(items, function (i, tasklist) {
		// auto generate color ID
		if (tasklist.colorID == undefined) {
			var factor = Math.abs(new String(tasklist.id).hashCode());
			tasklist.colorID = factor % Constants.tasklistColors;
		}
	});
	return new Tasklists(items);
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
	$.ajax({
		url: '/tasks/list',
		data: {
			tasklistID: tasklistID
		},
		dataType: 'json',
		success: function (response) {
			if ($.isArray(response.items)) {
				if ($.isFunction(callback)) {
					callback(Tasks.createFromJson(response.items));
				}
			}
			else {
				currentOAuth2Session.authorize();
			}
		}
	});
};
/**
 * Create an instance from JSON.
 * @param {Array} items JSON array
 * @returns {Tasks}
 */
Tasks.createFromJson = function (items) {
	$.each(items, function () {
		// due
		if (this.due) {
			this.dueDate = new Date(this.due);
			this.dueDate.setHours(0, 0, 0, 0);
		}
		else {
			this.dueDate = null;
		}
		// tasklist ID
		var uriParts = new String(this.selfLink).split('/');
		this.tasklistID = uriParts[uriParts.length - 3];
	});
	return new Tasks(items);
};
/**
 * @returns latest date time in milliseconds
 */
Tasks.prototype.latestTime = function () {
	if (this.items.length == 0) {
		return new Date().getTime();
	}
	return Math.max.apply(null, $.map(this.items, function (task) {
		if (task.dueDate) {
			return task.dueDate.getTime();
		}
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
		if (task.dueDate) {
			return task.dueDate.getTime();
		}
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