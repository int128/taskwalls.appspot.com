/**
 * @class tasklists and tasks
 */
function Taskdata () {
	this.initialize.apply(this, arguments);
};
/**
 */
Taskdata.prototype.initialize = function () {
	this.tasks = ko.observableArray();
	this.tasklists = ko.observableArray();
	this.tasksByDue = ko.computed(function () {
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
	).done(function () {
		// extract ID of the default tasklist if possible
		var defaultTasklistID = undefined;
		if (self.tasks().length > 0) {
			var p = self.tasks()[0].selfLink().split('/');
			defaultTasklistID = p[p.length - 3];
		}
		$.each(self.tasklists(), function (i, tasklist) {
			if (tasklist.id() == defaultTasklistID) {
				// replace instance of the default tasklist
				$.extend(defaultTasklist, tasklist);
				self.tasklists()[i] = defaultTasklist;
			} else {
				// load remaining tasklists
				Tasks.get(tasklist).done(function (tasks) {
					self.tasks($.merge(self.tasks(), tasks));
				});
			}
		});
	});
};
/**
 * Remove the item from collection. 
 * @param {Object} item item to remove {@link Task} or {@link Tasklist}
 */
Taskdata.prototype.remove = function (item) {
	if (item instanceof Task) {
		this.tasks.remove(item);
	} else if (item instanceof Tasklist) {
		this.tasks.remove(function (task) {
			return task.tasklist().id() == item.id();
		});
		this.tasklists.remove(item);
	} else {
		throw new TypeError('argument should be Task or Tasklist');
	}
};
/**
 * Clear completed tasks.
 */
Taskdata.prototype.clearCompletedTasks = function () {
	var self = this;
	$.each(this.tasklists(), function (i, tasklist) {
		tasklist.clearCompletedTasks().done(function () {
			self.tasks.remove(function (task) {
				return task.tasklist().id() == tasklist.id() && task.isCompleted();
			});
		});
	});
};
/**
 * @class set of tasklist
 */
function Tasklists () {
};
/**
 * Asynchronously get tasklists from server.
 * @returns {Deferred}
 */
Tasklists.get = function () {
	if (!taskwalls.settings.offline()) {
		return $.getJSON('/tasklists/list').pipe(function (response, status, xhr) {
			if (response) {
				var items = response.items;
				if ($.isArray(items)) {
					localStorage['Tasklists.get'] = xhr.responseText;
					taskwalls.settings.lastCached(new Date());
					return Tasklists.map(items);
				}
			}
			// ignore empty or bad data
			return [];
		});
	}
	else {
		return $.Deferred().resolve((function () {
			var response = $.parseJSON(localStorage['Tasklists.get']);
			if (response) {
				var items = response.items;
				if ($.isArray(items)) {
					return Tasklists.map(items);
				}
			}
			// ignore empty or bad data
			return [];
		})());
	}
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
 * Create a tasklist.
 * @param {Object} data
 * @returns {Deferred} call with new instance of {@link Tasklist}
 */
Tasklists.create = function (data) {
	if (!taskwalls.settings.offline()) {
		return $.post('/tasklists/create', data).pipe(function (object) {
			return new Tasklist(object);
		});
	} else {
		// TODO: offline
		return $.Deferred().resolve(new Tasklist($.extend({
			id: 'tasklist__' + $.now()
		}, data)));
	}
};
/**
 * @class the tasklist
 * @param {Object} object
 */
function Tasklist (object) {
	this.initialize.apply(this, arguments);
}
/**
 * @param {Object} object
 */
Tasklist.prototype.initialize = function (object) {
	ko.extendObservables(this, object);
	if ($.isNumeric(object.colorCode)) {
		this.colorCode = ko.observable(object.colorCode % taskwalls.settings.tasklistColors);
	} else {
		// auto generate
		this.colorCode = ko.observable(Math.abs(new String(object.id).hashCode())
				% taskwalls.settings.tasklistColors);
	}
};
/**
 * Save and update myself if succeeded.
 * @param {Object} data
 * @returns {Deferred}
 */
Tasklist.prototype.update = function (data) {
	var self = this;
	if (!taskwalls.settings.offline()) {
		return $.post('/tasklists/update', $.extend({id: this.id()}, data))
			.done(function () {
				ko.extendObservables(self, data);
			})
			.fail(function () {
				// FIXME: view model should do this
				ko.extendObservables(data, self);
			});
	} else {
		// TODO: offline
		return $.Deferred()
			.done(function () {
				ko.extendObservables(self, data);
			})
			.resolve();
	}
};
/**
 * Save and update myself if succeeded.
 * @param {Object} data
 * @returns {Deferred}
 */
Tasklist.prototype.updateMetadata = function (data) {
	var self = this;
	if (!taskwalls.settings.offline()) {
		return $.post('/tasklists/options/update', $.extend({id: this.id()}, data))
			.done(function () {
				ko.extendObservables(self, data);
			})
			.fail(function () {
				// FIXME: view model should do this
				ko.extendObservables(data, self);
			});
	} else {
		// TODO: offline
		return $.Deferred()
			.done(function () {
				ko.extendObservables(self, data);
			})
			.resolve();
	}
};
/**
 * Remove myself.
 * @returns {Deferred}
 */
Tasklist.prototype.remove = function () {
	if (!taskwalls.settings.offline()) {
		return $.post('/tasklists/delete', {id: this.id()});
	} else {
		// TODO: offline
		return $.Deferred().resolve();
	}
};
/**
 * Clear completed tasks in the tasklist.
 * @returns {Deferred}
 */
Tasklist.prototype.clearCompletedTasks = function () {
	if (!taskwalls.settings.offline()) {
		return $.post('/tasks/v1/lists/' + this.id() + '/clear');
	} else {
		// TODO: offline
		return $.Deferred().resolve();
	}
};
/**
 * @class set of task
 */
function Tasks () {
};
/**
 * Asynchronously get tasks from server.
 * @param {Tasklist}
 * @returns {Deferred}
 */
Tasks.get = function (tasklist) {
	if (!taskwalls.settings.offline()) {
		return $.getJSON('/tasks/list', {tasklistID: tasklist.id()}).pipe(function (response, status, xhr) {
			if (response) {
				var items = response.items;
				if ($.isArray(items)) {
					localStorage['Tasks.get.' + tasklist.id()] = xhr.responseText;
					return Tasks.map(items, tasklist);
				}
			}
			// ignore empty or bad data
			return [];
		});
	}
	else {
		return $.Deferred().resolve((function () {
			var response = $.parseJSON(localStorage['Tasks.get.' + tasklist.id()]);
			if (response) {
				var items = response.items;
				if ($.isArray(items)) {
					return Tasks.map(items, tasklist);
				}
			}
			// ignore empty or bad data
			return [];
		})());
	}
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
 * Create a task.
 * @param {Object} data
 * @returns {Deferred} call with new instance of {@link Task}
 */
Tasks.create = function (data) {
	if (!taskwalls.settings.offline()) {
		return $.post('/tasks/create', $.extend({}, data, {
			// specify zero for icebox
			due: data.due ? data.due.getUTCTime() : 0
		})).pipe(function (object) {
			return new Task(object);
		});
	} else {
		// TODO: offline
		return $.Deferred().resolve(new Task($.extend({
			id: 'task__' + $.now(),
			status: 'needsAction'
		}, data)));
	}
};
/**
 * Returns days.
 * @param {Array} tasks array of tasks
 * @returns {Array} array of time {@link Number}
 * TODO: remove this?
 */
Tasks.days = function (tasks) {
	return $.map(tasks, function (task) {
		var due = task.due();
		return due > 0 ? due : undefined;
	});
};
/**
 * Select items between beginTime and endTime.
 * Note that result does not contain endTime.
 * @param {Array} tasks
 * @param {Number} beginTime
 * @param {Number} endTime
 */
Tasks.range = function (tasks, beginTime, endTime) {
	return $.grep(tasks, function (task) {
		if (task.due()) {
			var due = task.due().getTime();
			if (beginTime <= due && due < endTime) {
				return true;
			}
		}
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
 * @returns {Tasks.DueIndex} map of due date and tasks
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
	return new Tasks.DueIndex(map);
};
/**
 * @constructor map of due date and tasks
 * @param {Object} map
 */
Tasks.DueIndex = function (map) {
	this.map = map;
};
/**
 * Get tasks of which due is the date.
 * @param {Date} date
 * @returns {Array} array of tasks or undefined
 */
Tasks.DueIndex.prototype.get = function (date) {
	var tasks = this.map[date.getTime()];
	return tasks ? tasks : [];
};
/**
 * Returns tasks of which due date is not determined.
 * @returns {Array}
 */
Tasks.DueIndex.prototype.getInIceBox = function () {
	var tasks = this.map[0];
	return tasks ? tasks : [];
};
/**
 * Returns tasks of which due date is before given.
 * @param {Number} date time of date
 * @returns {Array}
 */
Tasks.DueIndex.prototype.getBefore = function (time) {
	var tasks = [];
	$.each(this.map, function (key, tasksInDay) {
		var day = parseInt(key);
		if (day < time && day > 0) {
			$.merge(tasks, tasksInDay);
		}
	});
	return tasks;
};
/**
 * Returns tasks of which due date is before given.
 * @param {Number} date time of date
 * @returns {Array}
 */
Tasks.DueIndex.prototype.getAfter = function (time) {
	var tasks = [];
	$.each(this.map, function (key, tasksInDay) {
		var day = parseInt(key);
		if (day > time) {
			$.merge(tasks, tasksInDay);
		}
	});
	return tasks;
};
/**
 * @class the task
 * @param {Object} object
 * @param {Tasklist} tasklist belonged tasklist or undefined
 */
function Task (object, tasklist) {
	this.initialize.apply(this, arguments);
};
/**
 * @param {Object} object
 * @param {Tasklist} tasklist belonged tasklist or undefined
 */
Task.prototype.initialize = function (object, tasklist) {
	ko.extendObservables(this, object);
	this.tasklist = ko.observable(tasklist);
	if (object.notes === undefined) {
		this.notes = ko.observable();
	}
	if (object.due) {
		// normalize for current timezone
		// TODO: change to {Number} in order to save resource
		this.due(DateUtil.normalize(object.due));
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
/**
 * Save and update myself if succeeded.
 * @param {Object} data
 * @returns {Deferred}
 */
Task.prototype.update = function (data) {
	var self = this;
	if (!taskwalls.settings.offline()) {
		return $.post('/tasks/update', $.extend({}, data, {
				id: this.id(),
				tasklistID: this.tasklist().id(),
			}, data.due === undefined ? {} : {
				// specify zero for icebox
				due: data.due ? data.due.getUTCTime() : 0
			}))
			.done(function () {
				ko.extendObservables(self, data);
			})
			.fail(function () {
				// TODO: view model should do this...
				ko.extendObservables(data, self);
			});
	} else {
		// TODO: offline
		return $.Deferred()
			.done(function () {
				ko.extendObservables(self, data);
			})
			.resolve();
	}
};
/**
 * Move the task to another tasklist.
 * @param {Tasklist} tasklist destination
 * @returns {Deferred}
 */
Task.prototype.move = function (tasklist) {
	var self = this;
	if (!taskwalls.settings.offline()) {
		return $.post('/tasks/move', {
				id: this.id(),
				tasklistID: this.tasklist().id(),
				destinationTasklistID: tasklist.id()
			})
			.done(function () {
				self.tasklist(tasklist);
			});
	} else {
		// TODO: offline
		return $.Deferred()
			.done(function () {
				self.tasklist(tasklist);
			})
			.resolve();
	}
};
/**
 * Remove the task.
 * @returns {Deferred}
 */
Task.prototype.remove = function () {
	if (!taskwalls.settings.offline()) {
		return $.post('/tasks/delete', {
			id: this.id(),
			tasklistID: this.tasklist().id()
		});
	} else {
		// TODO: offline
		return $.Deferred().resolve();
	}
};
