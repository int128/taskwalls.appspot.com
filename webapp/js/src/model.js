/**
 * @constructor {@link Tasklists}
 */
function Tasklists () {
};
/**
 * Get tasklists from server.
 * @param {Function} callback async callback function
 */
Tasklists.get = function (callback) {
	if (!$.isFunction(callback)) {
		throw new Error('callback is not function');
	}
	if (AppSettings.offline()) {
		var response = $.parseJSON(localStorage.getItem('Tasklists.get'));
		if (response) {
			callback($.map(response.items, function (item) {
				return new Tasklist(item);
			}));
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
					AppSettings.setCachedDate(new Date());
					callback($.map(response.items, function (item) {
						return new Tasklist(item);
					}));
				}
			}
		});
	}
};
/**
 * @constructor {@link Tasklist}
 * @param {Object} item JSON objct
 */
function Tasklist (item) {
	$.extend(this, item);
	this.colorID = Math.abs(new String(this.id).hashCode()) % AppSettings.tasklistColors;
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
 * @constructor {@link Tasks}
 */
function Tasks () {
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
	if (AppSettings.offline()) {
		var response = $.parseJSON(localStorage['Tasks.get.' + tasklistID]);
		if (response) {
			callback(response.items);
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
					callback(response.items);
				}
			}
		});
	}
};