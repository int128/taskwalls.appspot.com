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
	var defaultTasklist = new Tasklist({id: '@default'});
	$.when(
		// asynchronously load tasks in the default tasklist
		Tasks.get(defaultTasklist).done(function (tasks) {
			self.tasks(tasks);
		}),
		// asynchronously load list of tasklists
		Tasklists.get().done(function (tasklists) {
			self.tasklists(tasklists);
		})
	).done(function (tasksInDefaultTasklist, tasklists) {
		// extract ID of the default tasklist
		var defaultTasklistID = undefined;
		if (tasksInDefaultTasklist.length > 0) {
			var p = tasksInDefaultTasklist[0].selfLink().split('/');
			defaultTasklistID = p[p.length - 3];
		}
		// load remaining tasklists
		$.each(tasklists, function (i, tasklist) {
			if (tasklist.id() == defaultTasklistID) {
				// fix the default tasklist
				$.extend(defaultTasklist, tasklist);
			} else {
				// merge tasks in other tasklists
				Tasks.get(tasklist).done(function (tasks) {
					self.tasks($.merge(self.tasks(), tasks));
				});
			}
		});
	});
};
/**
 * @class set of tasklist
 */
function Tasklists () {
};
Tasklists.prototype = {};
/**
 * Asynchronously get tasklists from server.
 * @returns {Deferred}
 */
Tasklists.get = function () {
	var deferred = $.Deferred();
	if (AppSettings.offline()) {
		var response = $.parseJSON(localStorage.getItem('Tasklists.get'));
		if (response) {
			deferred.resolve(Tasklists.map(response.items));
		}
	}
	else {
		$.getJSON('/tasklists/list').then(function (response, status, xhr) {
			if (response) {
				localStorage.setItem('Tasklists.get', xhr.responseText);
				AppSettings.lastCached(new Date());
				deferred.resolve(Tasklists.map(response.items));
			}
		});
	}
	return deferred;
};
/**
 * Map JSON to {@link Tasklist}.
 * @param {Array} items
 * @returns {Array}
 */
Tasklists.map = function (items) {
	return $.map(items, function (item) {
		return new Tasklist(item);
	});
};
/**
 * @class the tasklist
 * @param {Object} object
 */
function Tasklist (object) {
	ko.mapObservables(object, this);
	if (object.colorCode === undefined) {
		// auto generate
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
 * @param {Tasklist}
 * @returns {Deferred}
 */
Tasks.get = function (tasklist) {
	var tasklistID = tasklist.id();
	var deferred = $.Deferred();
	if (AppSettings.offline()) {
		var response = $.parseJSON(localStorage['Tasks.get.' + tasklistID]);
		if (response) {
			deferred.resolve(Tasks.map(response.items, tasklist));
		}
	}
	else {
		$.getJSON('/tasks/list', {tasklistID: tasklistID}).then(function (response, status, xhr) {
			if (response) {
				localStorage['Tasks.get.' + tasklistID] = xhr.responseText;
				deferred.resolve(Tasks.map(response.items, tasklist));
			}
		});
	}
	return deferred;
};
/**
 * Map JSON to {@link Task}.
 * @param {Array} items
 * @param {Tasklist} tasklist belonged tasklist or undefined
 * @returns {Array}
 */
Tasks.map = function (items, tasklist) {
	return $.map(items, function (item) {
		return new Task(item, tasklist);
	});
};
/**
 * Returns map of tasklist and tasks.
 * @param {Array} tasks array of tasks or undefined
 * @returns {Object} map of tasklist id and tasks
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
 * @param {Object} object
 * @param {Tasklist} tasklist belonged tasklist or undefined
 */
function Task (object, tasklist) {
	ko.mapObservables(object, this);
	this.tasklist = ko.observable(tasklist);
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
