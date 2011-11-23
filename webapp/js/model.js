/**
 * @class represents tasklists model
 * @param {Array} items array of {@link Tasklist}
 */
function Tasklists (items) {
	this.items = items;
};
/**
 * Get {@link Tasklists} from server.
 * @param {Function} callback async callback function
 */
Tasklists.get = function (callback) {
	if (!$.isFunction(callback)) {
		throw new Error('callback is not function');
	}
	$.ajax({
		url: '/tasklists/list',
		dataType: 'json',
		/**
		 * Handler.
		 * @param response
		 * @param {String} status
		 * @param {XMLHttpRequest} xhr
		 */
		success: function (response, status, xhr) {
			if ($.isArray(response.items)) {
				localStorage.setItem('Tasklists.get', xhr.responseText);
				callback(Tasklists.createFromJson(response.items));
			}
			else {
				throw new Error('invalid JSON response of tasklists');
			}
		},
		/**
		 * Offline handler.
		 * @param {XMLHttpRequest} xhr
		 * @param {String} status
		 * @param {Error} error
		 */
		error: function (xhr, status, error) {
			var response = $.parseJSON(localStorage.getItem('Tasklists.get'));
			if ($.isArray(response.items)) {
				callback(Tasklists.createFromJson(response.items));
			}
			else {
				throw new Error('invalid JSON of tasklists in cache');
			}
		}
	});
};
/**
 * Create an instance from JSON.
 * @param {Array} items array of JSON tasklist
 * @returns {Tasklists}
 */
Tasklists.createFromJson = function (items) {
	return new Tasklists($.map(items, function (item) {
		return new Tasklist(item);
	}));
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
 * Constructor.
 * @param {Object} json natural JSON
 */
function Tasklist (json) {
	for (var key in json) {
		this[key] = json[key];
	}
	// auto generate color ID
	if (this.colorID == undefined) {
		var factor = Math.abs(new String(this.id).hashCode());
		this.colorID = factor % Constants.tasklistColors;
	}
}
/**
 * Constructor.
 * @class represents tasks model
 * @param {Array} items array of {@link Task}
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
	if (!$.isFunction(callback)) {
		throw new Error('callback is not function');
	}
	$.ajax({
		url: '/tasks/list',
		data: {
			tasklistID: tasklistID
		},
		dataType: 'json',
		/**
		 * Handler.
		 * @param response
		 * @param {String} status
		 * @param {XMLHttpRequest} xhr
		 */
		success: function (response, status, xhr) {
			if ($.isArray(response.items)) {
				localStorage['Tasks.get.' + tasklistID] = xhr.responseText;
				callback(Tasks.createFromJson(response.items));
			}
			else {
				throw new Error('invalid JSON response of tasks');
			}
		},
		/**
		 * Offline handler.
		 * @param {XMLHttpRequest} xhr
		 * @param {String} status
		 * @param {Error} error
		 */
		error: function (xhr, status, error) {
			var response = $.parseJSON(localStorage['Tasks.get.' + tasklistID]);
			if ($.isArray(response.items)) {
				callback(Tasks.createFromJson(response.items));
			}
			else {
				throw new Error('invalid JSON of tasks in cache');
			}
		}
	});
};
/**
 * Create an instance from JSON.
 * @param {Array} items array of JSON task
 * @returns {Tasks}
 */
Tasks.createFromJson = function (items) {
	return new Tasks($.map(items, function (item) {
		return new Task(item);
	}));
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
/**
 * Constructor.
 * @param {Object} json natural JSON
 * @returns {Task} instance
 */
function Task (json) {
	for (var key in json) {
		this[key] = json[key];
	}
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
};
