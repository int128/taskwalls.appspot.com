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

	this.transactions = ko.observableArray();
};

/**
 * @constructor set of task
 */
function Tasks () {
};
Tasks.prototype = {};

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
		tasks.forEach(function (task) {
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
		tasks.forEach(function (task) {
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

	if (object.completed) {
		// convert to local Date (response is UTC string)
		this.completed(DateUtil.clearTimePart(new Date(this.completed())));
	} else {
		this.completed = ko.observable();
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

	this.past = ko.computed(function () {
		return this.due() < DateUtil.today();
	}, this);

	this.transactions = ko.observableArray();
};

/**
 * Execute all transactions of this task sequentially.
 * 
 * If transactions <code>[t1, t2, t3]</code> are given:
 * <code><pre>
 * t1.execute().done(function () {
 *   t2.execute().done(function () {
 *     t3.execute();
 *   });
 * });
 * </pre></code>
 */
Task.prototype.executeTransactions = function () {
	this.transactions()
		.map(function (transaction) {
			return transaction.execute.bind(transaction);
		})
		.reduceRight(function (x, y) {
			return function () {
				y().done(x);
			};
		})();
};

/**
 * Roll back all transactions of this task sequentially.
 * 
 * If transactions <code>[t1, t2, t3]</code> are given:
 * <code><pre>
 * t3.rollback().done(function () {
 *   t2.rollback().done(function () {
 *     t1.rollback();
 *   });
 * });
 * </pre></code>
 */
Task.prototype.rollbackTransactions = function () {
	this.transactions()
		.map(function (transaction) {
			return transaction.rollback.bind(transaction);
		})
		.reduce(function (x, y) {
			return function () {
				y().done(x);
			};
		})();
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
