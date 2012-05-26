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
 * @constructor {@link Tasks}
 * @param {Array} items
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
			callback(new Tasks(response.items));
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
					callback(new Tasks(response.items));
				}
			}
		});
	}
};