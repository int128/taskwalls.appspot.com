/**
 * @class tasklists and tasks
 */
function Taskdata () {
	this.initialize.apply(this, arguments);
};

Taskdata.prototype.initialize = function () {
	this.tasks = ko.observableArray();
	this.tasklists = ko.observableArray();

	this.dueIndex = ko.computed(function () {
		return Tasks.groupByDue(this.tasks());
	}, this);
};

/**
 * Asynchronously load task data from server.
 */
Taskdata.prototype.load = function () {
	var self = this;
	var defaultTasklist = new Tasklist({
		id: '@default'
	});

	var loadTasksInDefaultTasklist = Tasks.get(defaultTasklist).done(function (tasks) {
		self.tasks(tasks);
	});
	var loadTasklists = Tasklists.get().done(function (tasklists) {
		self.tasklists(tasklists);
	});

	$.when(loadTasksInDefaultTasklist, loadTasklists).done(function () {
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
 * 
 * @param {Object}
 *            item item to remove {@link Task} or {@link Tasklist}
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
Tasklists.prototype = {};

/**
 * Asynchronously get tasklists from server.
 * 
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
					return items.map(function (item) {
						return new Tasklist(item);
					});
				}
			}
			// ignore empty or bad data
			return [];
		});
	} else {
		return $.Deferred().resolve((function () {
			var response = $.parseJSON(localStorage['Tasklists.get']);
			if (response) {
				var items = response.items;
				if ($.isArray(items)) {
					return items.map(function (item) {
						return new Tasklist(item);
					});
				}
			}
			// ignore empty or bad data
			return [];
		})());
	}
};

/**
 * Create a tasklist.
 * 
 * @param {Object}
 *            data
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
 * @param {Object}
 *            object
 */
function Tasklist (object) {
	this.initialize.apply(this, arguments);
}

/**
 * @param {Object}
 *            object
 */
Tasklist.prototype.initialize = function (object) {
	ko.extendObservables(this, object);

	this.colorCode = ko.observable((function () {
		if ($.isNumeric(object.colorCode)) {
			return object.colorCode;
		} else {
			return Math.abs(new String(object.id).hashCode()); // auto generate
		}
	})() % taskwalls.settings.tasklistColors);
};

/**
 * Save and update myself if succeeded.
 * 
 * @param {Object}
 *            data
 * @returns {Deferred}
 */
Tasklist.prototype.update = function (data) {
	var self = this;
	if (!taskwalls.settings.offline()) {
		var request = $.extend({
			id: this.id()
		}, data);
		return $.post('/tasklists/update', request).done(function () {
			ko.extendObservables(self, data);
		}).fail(function () {
			// FIXME: view model should do this
			ko.extendObservables(data, self);
		});
	} else {
		// TODO: offline
		return $.Deferred().done(function () {
			ko.extendObservables(self, data);
		}).resolve();
	}
};

/**
 * Save and update myself if succeeded.
 * 
 * @param {Object}
 *            data
 * @returns {Deferred}
 */
Tasklist.prototype.updateMetadata = function (data) {
	var self = this;
	if (!taskwalls.settings.offline()) {
		var request = $.extend({
			id: this.id()
		}, data);
		return $.post('/tasklists/options/update', request).done(function () {
			ko.extendObservables(self, data);
		}).fail(function () {
			// FIXME: view model should do this
			ko.extendObservables(data, self);
		});
	} else {
		// TODO: offline
		return $.Deferred().done(function () {
			ko.extendObservables(self, data);
		}).resolve();
	}
};

/**
 * Remove myself.
 * 
 * @returns {Deferred}
 */
Tasklist.prototype.remove = function () {
	if (!taskwalls.settings.offline()) {
		return $.post('/tasklists/delete', {
			id: this.id()
		});
	} else {
		// TODO: offline
		return $.Deferred().resolve();
	}
};

/**
 * @constructor set of task
 */
function Tasks () {
};
Tasks.prototype = {};

/**
 * Asynchronously get tasks from server.
 * 
 * @param {Tasklist}
 * @returns {Deferred}
 */
Tasks.get = function (tasklist) {
	if (!taskwalls.settings.offline()) {
		return $.getJSON('/tasks/list', {
			tasklistID: tasklist.id()
		}).pipe(function (response, status, xhr) {
			if (response) {
				var items = response.items;
				if ($.isArray(items)) {
					localStorage['Tasks.get.' + tasklist.id()] = xhr.responseText;
					return items.map(function (item) {
						return new Task(item, tasklist);
					});
				}
			}
			// ignore empty or bad data
			return [];
		});
	} else {
		return $.Deferred().resolve((function () {
			var response = $.parseJSON(localStorage['Tasks.get.' + tasklist.id()]);
			if (response) {
				var items = response.items;
				if ($.isArray(items)) {
					return items.map(function (item) {
						return new Task(item, tasklist);
					});
				}
			}
			// ignore empty or bad data
			return [];
		})());
	}
};

/**
 * Create a task.
 * 
 * @param {Object}
 *            data
 * @returns {Deferred} call with new instance of {@link Task}
 */
Tasks.create = function (data) {
	if (!taskwalls.settings.offline()) {
		return $.post('/tasks/create', $.extend({}, data, {
			// specify zero for icebox
			due: data.due ? DateUtil.calculateTimeInUTC(data.due) : 0
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
 * Returns array of tasklist groups.
 * <p>
 * An element of array will be following.
 * </p>
 * <code><pre>
 * {
 * 	tasklist: tasklist,
 * 	tasks: tasksInTheTasklist
 * }
 * </pre></code>
 * 
 * @param {Array}
 *            tasks array of tasks or undefined
 * @returns {Array} array of tasklists, each contains tasklist and tasks.
 */
Tasks.groupByTasklist = function (tasks) {
	var map = {};
	if ($.isArray(tasks)) {
		$.each(tasks, function (i, task) {
			var key = task.tasklist().id();
			if ($.isArray(map[key])) {
				map[key].push(task);
			} else {
				map[key] = [ task ];
			}
		});
	}
	return $.map(map, function (tasksInTasklist) {
		return {
			tasklist: tasksInTasklist[0].tasklist(),
			tasks: tasksInTasklist
		};
	});
};

/**
 * Returns map of due date and tasks.
 * 
 * @param {Array}
 *            tasks array of tasks or undefined
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
				map[key] = [ task ];
			}
		});
	}
	return new Tasks.DueIndex(map);
};

/**
 * @constructor map of due date and tasks
 * @param {Object}
 *            map
 */
Tasks.DueIndex = function (map) {
	this.map = map;
};

/**
 * Get tasks of which due is the date.
 * 
 * @param {Number}
 *            time
 * @returns {Array} array of tasks or undefined
 */
Tasks.DueIndex.prototype.getTasks = function (time) {
	var tasks = this.map[time];
	return tasks ? tasks : [];
};

/**
 * Returns tasks of which due date is not determined.
 * 
 * @returns {Array}
 */
Tasks.DueIndex.prototype.getTasksInIceBox = function () {
	return this.getTasks(0);
};

/**
 * @class the task
 * @param {Object}
 *            object
 * @param {Tasklist}
 *            tasklist belonged tasklist or undefined
 */
function Task (object, tasklist) {
	this.initialize.apply(this, arguments);
};

/**
 * @param {Object}
 *            object
 * @param {Tasklist}
 *            tasklist belonged tasklist or undefined
 */
Task.prototype.initialize = function (object, tasklist) {
	ko.extendObservables(this, object);

	this.tasklist = ko.observable(tasklist);

	if (object.notes === undefined) {
		this.notes = ko.observable();
	}

	if (object.due) {
		// convert to local Date (response is UTC string)
		this.due(DateUtil.clearTimePart(new Date(this.due())));
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
 * 
 * @param {Object}
 *            data
 * @returns {Deferred}
 */
Task.prototype.update = function (data) {
	var self = this;
	if (!taskwalls.settings.offline()) {
		var request = $.extend({}, data, {
			id: this.id(),
			tasklistID: this.tasklist().id(),
		}, data.due === undefined ? {} : {
			// specify zero if for icebox
			due: data.due ? DateUtil.calculateTimeInUTC(data.due) : 0
		});
		return $.post('/tasks/update', request).done(function () {
			ko.extendObservables(self, data);
		}).fail(function () {
			// TODO: view model should do this...
			ko.extendObservables(data, self);
		});
	} else {
		// TODO: offline
		return $.Deferred().done(function () {
			ko.extendObservables(self, data);
		}).resolve();
	}
};

/**
 * Move the task to another tasklist.
 * 
 * @param {Tasklist}
 *            tasklist destination
 * @returns {Deferred}
 */
Task.prototype.move = function (tasklist) {
	var self = this;
	if (!taskwalls.settings.offline()) {
		var request = {
			id: this.id(),
			tasklistID: this.tasklist().id(),
			destinationTasklistID: tasklist.id()
		};
		return $.post('/tasks/move', request).done(function () {
			self.tasklist(tasklist);
		});
	} else {
		// TODO: offline
		return $.Deferred().done(function () {
			self.tasklist(tasklist);
		}).resolve();
	}
};

/**
 * Remove the task.
 * 
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

/**
 * @class filter functions for {@link Task}
 */
function TaskFilters () {
};
TaskFilters.prototype = {};

/**
 * Generate a filter function for status.
 * 
 * @param {String}
 *            status
 * @returns {Function}
 */
TaskFilters.status = function (status) {
	return function (task) {
		return task.status() == status;
	};
};

/**
 * Generate a filter function for due.
 * 
 * @param {Number}
 *            time
 * @returns {Function}
 */
TaskFilters.dueBefore = function (time) {
	return function (task) {
		if (task.due()) {
			var due = task.due().getTime();
			return 0 < due && due < time;
		}
		return false;
	};
};

/**
 * Generate a filter function for due.
 * 
 * @param {Number}
 *            min earliest time (contains this)
 * @param {Number}
 *            max latest time (contains this)
 * @returns {Function}
 */
TaskFilters.dueRange = function (min, max) {
	return function (task) {
		if (task.due()) {
			var due = task.due().getTime();
			return min <= due && due <= max;
		}
		return false;
	};
};
