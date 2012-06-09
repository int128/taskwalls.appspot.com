/**
 * @class calendar
 */
function Calendar () {
	var today = AppSettings.today();
	this.days = ko.observableArray([today]);
	this.earliestTime = ko.observable(today.getTime());
	this.latestTime = ko.observable(today.getTime());
};
/**
 * Extend rows of the calendar.
 * Do not call this function in ko.computed() scope.
 * @param {Date} time time to extend (also accepts {Number})
 */
Calendar.prototype.extendTo = function (time) {
	var normalizedTime = DateUtil.normalize(time).getTime();
	if (normalizedTime > this.latestTime()) {
		// append rows
		var a = [];
		var i = 0;
		for (var t = this.latestTime() + 86400000; t <= normalizedTime; t += 86400000) {
			a[i++] = new Date(t);
		}
		this.days(this.days().concat(a));
		this.latestTime(normalizedTime);
	}
	if (normalizedTime < this.earliestTime()) {
		// prepend rows
		var a = [];
		var i = 0;
		var e = this.earliestTime();
		for (var t = normalizedTime; t < e; t += 86400000) {
			a[i++] = new Date(t);
		}
		this.days(a.concat(this.days()));
		this.earliestTime(normalizedTime);
	}
};
/**
 * @class tasklists and tasks
 */
function Taskdata () {
	this.tasks = ko.observableArray();
	this.tasklists = ko.observableArray();
	this.dueMap = ko.computed(function () {
		return Tasks.groupByDue(this.tasks());
	}, this);
};
/**
 * Asynchronously load task data from server.
 */
Taskdata.prototype.load = function () {
	var self = this;

	var defaultTasklistID = null;
	var tasklistsLoaded = false;

	// TODO: use $.Deferred()
	// step3: executed after step1 and step2
	var loadAllTasklists = function () {
		if (defaultTasklistID && tasklistsLoaded) {
			$.each(self.tasklists(), function (i, tasklist) {
				if (tasklist.id() == defaultTasklistID) {
					// fix tasks in the default tasklist
					$.each(self.tasks(), function (i2, task) {
						if (task.tasklist().id() == '@default') {
							task.tasklist(tasklist);
						}
					});
				} else {
					// merge tasks in other tasklists
					Tasks.get(tasklist.id(), function (tasks) {
						$.each(tasks, function (i3, task) {
							task.tasklist(tasklist);
						});
						self.tasks($.merge(self.tasks(), tasks));
					});
				}
			});
		}
	};
	// step1: asynchronously load tasks in the default tasklist
	Tasks.get('@default', function (tasks) {
		if (tasks.length > 0) {
			// assign to provisional default tasklist
			var defaultTasklist = new Tasklist({id: '@default'});
			$.each(tasks, function (i, task) {
				task.tasklist(defaultTasklist);
			});
			self.tasks(tasks);
			// extract tasklist ID from URL
			var p = new String(tasks[0].selfLink()).split('/');
			defaultTasklistID = p[p.length - 3];
			loadAllTasklists();
		}
	});
	// step2: asynchronously load list of tasklists
	Tasklists.get(function (tasklists) {
		if (tasklists.length > 0) {
			self.tasklists(tasklists);
			tasklistsLoaded = true;
			loadAllTasklists();
		}
	});
};
/**
 * @class set of tasklist
 */
function Tasklists () {
};
/**
 * Asynchronously get tasklists from server.
 * @param {Function} callback function (array of tasklist object)
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
					AppSettings.lastCached(new Date());
					callback($.map(response.items, function (item) {
						return new Tasklist(item);
					}));
				}
			}
		});
	}
};
/**
 * @class the tasklist
 * @param {Object} object
 */
function Tasklist (object) {
	ko.mapObservables(object, this);
	// FIXME: fix server-side model (colorID -> colorCode)
	if (object.colorID) {
		this.colorCode = ko.observable(object.colorID);
	} else {
		this.colorCode = ko.observable(Math.abs(this.id().hashCode()) % AppSettings.tasklistColors);
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
 * @class set of task
 */
function Tasks () {
};
Tasks.prototype = {};
/**
 * Asynchronously get tasks from server.
 * @param {String} tasklistID task list ID
 * @param {Function} callback function (array of task object)
 */
Tasks.get = function (tasklistID, callback) {
	if (!$.isFunction(callback)) {
		throw new Error('callback is not function');
	}
	if (AppSettings.offline()) {
		var response = $.parseJSON(localStorage['Tasks.get.' + tasklistID]);
		if (response) {
			callback($.map(response.items, function (item) {
				return new Task(item);
			}));
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
					callback($.map(response.items, function (item) {
						return new Task(item);
					}));
				}
			}
		});
	}
};
/**
 * Returns map of tasklist and tasks.
 * @param {Array} tasks array of tasks or undefined
 */
Tasks.groupByTasklist = function (tasks) {
	var map = {};
	if ($.isArray(tasks)) {
		$.each(tasks, function (i, task) {
			var key = task.tasklist().id();
			if ($.isArray(map[key])) {
				map[key].push(task);
			} else {
				map[key] = [task];
			}
		});
	}
	return map;
};
/**
 * Returns map of due date and tasks.
 * @param {Array} tasks array of tasks or undefined
 * @returns {Tasks.DueMap} map of due date and tasks
 */
Tasks.groupByDue = function (tasks) {
	var map = {};
	if ($.isArray(tasks)) {
		$.each(tasks, function (i, task) {
			var due = task.due();
			var key = 0;
			if (due) {
				key = due.getTime();
			}
			if ($.isArray(map[key])) {
				map[key].push(task);
			} else {
				map[key] = [task];
			}
		});
	}
	return new Tasks.DueMap(map);
};
/**
 * @class map of due date and tasks
 * @param {Object} map
 */
Tasks.DueMap = function (map) {
	this.map = map;
};
/**
 * Get tasks of which due is the date.
 * @param {Date} date
 * @returns {Array} array of tasks or undefined
 */
Tasks.DueMap.prototype.get = function (date) {
	var tasks = this.map[date.getTime()];
	return tasks ? tasks : [];
};
/**
 * Returns tasks of which due date is unknown.
 * @returns {Array}
 */
Tasks.DueMap.prototype.getToBeDetermined = function () {
	var tasks = this.map[0];
	return tasks ? tasks : [];
};
/**
 * Returns days.
 * @returns {Array} array of time {@link Number}
 */
Tasks.DueMap.prototype.days = function () {
	return $.map(this.map, function (v, k) {
		return k > 0 ? k : undefined;
	});
};
/**
 * @class the task
 * @param object {Object} object
 */
function Task (object) {
	ko.mapObservables(object, this);
	this.tasklist = ko.observable();
	if (this.notes === undefined) {
		this.notes = ko.observable();
	}
	if (this.due) {
		// normalize for current timezone
		this.due(DateUtil.normalize(this.due()));
	} else {
		this.due = ko.observable();
	}
	this.isCompleted = ko.computed({
		read: function () {
			return this.status() == 'completed';
		},
		write: function (value) {
			this.status(value ? 'completed' : 'needsAction');
		},
		owner: this
	});
};
