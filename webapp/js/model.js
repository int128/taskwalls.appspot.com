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
	if (AppSettings.isOffline()) {
		var response = $.parseJSON(localStorage.getItem('Tasklists.get'));
		if (response) {
			callback(Tasklists.createFromJson(response));
		}
	}
	else {
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
				if (response) {
					localStorage.setItem('Tasklists.get', xhr.responseText);
					AppSettings.setCachedDate('Tasklists.get', new Date());
					callback(Tasklists.createFromJson(response));
				}
			}
		});
	}
};
/**
 * Create an instance from JSON.
 * @param response natural JSON of tasklists
 * @returns {Tasklists}
 */
Tasklists.createFromJson = function (response) {
	var items = [];
	if ($.isArray(response.items)) {
		items = response.items;
	}
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
		this.colorID = factor % AppSettings.tasklistColors;
	}
}
/**
 * Clear completed tasks in the tasklist.
 * @param {Function} success
 * @param {Function} error
 */
Tasklist.prototype.clearCompleted = function (success, error) {
	$.ajax({
		url: '/tasks/v1/lists/' + this.id + '/clear',
		type: 'POST',
		/**
		 * @param {XMLHttpRequest} xhr
		 */
		beforeSend: function (xhr) {
			xhr.setRequestHeader('X-HTTP-Method-Override', 'POST');
		},
		dataType: 'json',
		success: success,
		error: error
	});
};
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
	if (AppSettings.isOffline()) {
		var response = $.parseJSON(localStorage['Tasks.get.' + tasklistID]);
		if (response) {
			callback(Tasks.createFromJson(response));
		}
	}
	else {
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
				if (response) {
					localStorage['Tasks.get.' + tasklistID] = xhr.responseText;
					callback(Tasks.createFromJson(response));
				}
			}
		});
	}
};
/**
 * Create an instance from JSON.
 * @param response natural JSON of tasks
 * @returns {Tasks}
 */
Tasks.createFromJson = function (response) {
	var items = [];
	if ($.isArray(response.items)) {
		items = response.items;
	}
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
	// FIXME: appears that selfLink does not contain its tasklist ID. (2011/12/9)
	// tasklist ID
	var uriParts = new String(this.selfLink).split('/');
	this.tasklistID = uriParts[uriParts.length - 3];
};
