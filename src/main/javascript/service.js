/**
 * @class transaction of service operation
 * @param {Function}
 *            operation operation function
 * @param {Function}
 *            rollback rollback function
 */
function ServiceTransaction (operation, rollback) {
	this.operation = operation;
	this.rollback = rollback;
	this.deferred = $.Deferred();
	this.pending = ko.observable(true);
};

ServiceTransaction.prototype.promise = function () {
	if (taskwalls.settings.offline()) {
		return this.deferred;
	} else {
		return this.execute();
	}
};

ServiceTransaction.prototype.execute = function () {
	return this.operation()
		.fail(this.rollback)
		.then(this.pending.bind(this, false))
		.done(this.deferred.resolve)
		.fail(this.deferred.reject);
};

/**
 * @class service class for {@link Tasklist}
 */
function TaskdataService () {
};
TaskdataService.prototype = {};

/**
 * Asynchronously load tasks and task lists from server.
 * 
 * @param {Taskdata}
 *            taskdata
 */
TaskdataService.fetch = function (taskdata) {
	var defaultTasklist = new Tasklist({
		id: '@default'
	});

	var fetchTasks = TaskService.fetch(defaultTasklist).done(
			taskdata.tasks.bind(taskdata));
	var fetchTasklists = TasklistService.fetch().done(
			taskdata.tasklists.bind(taskdata));
	var fetchRemaining = function () {
		var defaultTasklistID = undefined;
		if (taskdata.tasks().length > 0) {
			// extract ID of the default tasklist if possible
			var p = taskdata.tasks()[0].selfLink().split('/');
			defaultTasklistID = p[p.length - 3];
		}
		return taskdata.tasklists().map(function (tasklist, i) {
			if (tasklist.id() == defaultTasklistID) {
				$.extend(defaultTasklist, tasklist);
				// replace instance of the default tasklist
				taskdata.tasklists()[i] = defaultTasklist;
			} else {
				return TaskService.fetch(tasklist).done(function (tasks) {
					taskdata.tasks($.merge(taskdata.tasks(), tasks));
				});
			}
		});
	};

	$.when(fetchTasks, fetchTasklists).done(function () {
		$.when.apply(null, fetchRemaining()).done(function () {
			if (taskwalls.settings.offline()) {
				taskwalls.settings.offlineLoaded(true);
			} else {
				taskwalls.settings.lastCached(new Date());
			}
		});
	});
};

/**
 * @class service class for {@link Tasklist}
 */
function TasklistService () {
};
TasklistService.prototype = {};

/**
 * Asynchronously fetch task lists from server.
 * 
 * @returns {Deferred}
 */
TasklistService.fetch = function () {
	if (taskwalls.settings.offline()) {
		return TasklistService.fetch.offline();
	} else {
		return TasklistService.fetch.online();
	}
};

TasklistService.fetch.online = function () {
	return $.getJSON('/tasklists/list').pipe(function (response, status, xhr) {
		if (response) {
			var items = response.items;
			if ($.isArray(items)) {
				localStorage['Tasklists.get'] = xhr.responseText;
				return items.map(function (item) {
					return new Tasklist(item);
				});
			}
		}
		// ignore empty or bad data
		return [];
	});
};

TasklistService.fetch.offline = function () {
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
};

/**
 * Create a task list.
 * 
 * @param {Taskdata}
 *            taskdata
 * @param {Object}
 *            data
 * @returns {Deferred} call with an new instance of {@link Tasklist}
 */
TasklistService.create = function (taskdata, data) {
	var mock = new Tasklist($.extend({
		id: 'tasklist__' + $.now()
	}, data));
	taskdata.tasklists.push(mock);

	var transaction = new ServiceTransaction(
			TasklistService.create.executeFunction(taskdata, data, mock),
			TasklistService.create.rollbackFunction(taskdata, data, mock));

	mock.transactions.push(transaction);
	return transaction.promise();
};

TasklistService.create.executeFunction = function (taskdata, data, mock) {
	return function () {
		return $.post('/tasklists/create', data).pipe(function (object) {
			return new Tasklist(object);
		}).done(function (tasklist) {
			taskdata.tasklists.push(tasklist);
			taskdata.tasklists.remove(mock);
		});
	};
};

TasklistService.create.rollbackFunction = function (taskdata, data, mock) {
	return function () {
		return taskdata.tasklists.remove(mock);
	};
};

/**
 * Save the task list.
 * 
 * @param {Tasklist}
 *            tasklist
 * @param {Object}
 *            data
 * @returns {Deferred}
 */
TasklistService.update = function (tasklist, data) {
	var transaction = new ServiceTransaction(
			TasklistService.update.executeFunction(tasklist, data),
			TasklistService.update.rollbackFunction(tasklist, data));

	ko.extendObservables(tasklist, data);

	tasklist.transactions.push(transaction);
	return transaction.promise();
};

TasklistService.update.executeFunction = function (tasklist, data) {
	var request = $.extend({
		id: tasklist.id()
	}, data);
	return $.post.bind(null, '/tasklists/update', request);
};

TasklistService.update.rollbackFunction = function (tasklist, data) {
	var originalData = {};
	$.each(data, function (k, v) {
		originalData[k] = tasklist[k]();
	});
	return ko.extendObservables.bind(null, tasklist, originalData);
};

/**
 * Save extension data of the task list.
 * 
 * @param {Tasklist}
 *            tasklist
 * @param {Object}
 *            data
 * @returns {Deferred}
 */
TasklistService.updateExtension = function (tasklist, data) {
	var transaction = new ServiceTransaction(
			TasklistService.updateExtension.executeFunction(tasklist, data),
			TasklistService.updateExtension.rollbackFunction(tasklist, data));

	ko.extendObservables(tasklist, data);

	tasklist.transactions.push(transaction);
	return transaction.promise();
};

TasklistService.updateExtension.executeFunction = function (tasklist, data) {
	var request = $.extend({
		id: tasklist.id()
	}, data);
	return $.post.bind(null, '/tasklists/extension/update', request);
};

TasklistService.updateExtension.rollbackFunction = function (tasklist, data) {
	var originalData = {};
	$.each(data, function (k, v) {
		originalData[k] = tasklist[k]();
	});
	return ko.extendObservables.bind(null, tasklist, originalData);
};

/**
 * Remove the task list.
 * 
 * @param {Taskdata}
 *            taskdata
 * @param {Tasklist}
 *            tasklist
 * @returns {Deferred}
 */
TasklistService.remove = function (taskdata, tasklist) {
	var transaction = new ServiceTransaction(
			TasklistService.remove.executeFunction(taskdata, tasklist),
			TasklistService.remove.rollbackFunction(taskdata, tasklist));

	tasklist.transactions.push(transaction);
	return transaction.promise();
};

TasklistService.remove.executeFunction = function (taskdata, tasklist) {
	var identity = {
		id: tasklist.id()
	};
	return function () {
		return $.post('/tasklists/delete', identity).done(function () {
			taskdata.tasklists.remove(tasklist);
		});
	};
};

TasklistService.remove.rollbackFunction = function (taskdata, tasklist) {
	return function () {
		return taskdata.tasklists.push(tasklist);
	};
};

/**
 * @class service class for {@link Task}
 */
function TaskService () {
};
TaskService.prototype = {};

/**
 * Asynchronously fetch tasks from server.
 * 
 * @param {Tasklist}
 *            tasklist
 * @returns {Deferred}
 */
TaskService.fetch = function (tasklist) {
	if (taskwalls.settings.offline()) {
		return TaskService.fetch.offline(tasklist);
	} else {
		return TaskService.fetch.online(tasklist);
	}
};

TaskService.fetch.online = function (tasklist) {
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
};

TaskService.fetch.offline = function (tasklist) {
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
};

/**
 * Create a task.
 * 
 * @param {Taskdata}
 *            taskdata
 * @param {Object}
 *            data
 * @returns {Deferred} call with new instance of {@link Task}
 */
TaskService.create = function (taskdata, data) {
	var mock = new Task($.extend({
		id: 'task__' + $.now(),
		status: 'needsAction'
	}, data));
	TaskService.create.fixTasklistReference(mock, data.tasklistID, taskdata);
	taskdata.tasks.push(mock);

	var transaction = new ServiceTransaction(
			TaskService.create.executeFunction(taskdata, data, mock),
			TaskService.create.rollbackFunction(taskdata, data, mock));

	mock.transactions.push(transaction);
	return transaction.promise();
};

TaskService.create.executeFunction = function (taskdata, data, mock) {
	var due = {
		// specify zero for icebox
		due: data.due ? DateUtil.calculateTimeInUTC(data.due) : 0
	};
	return function () {
		return $.post('/tasks/create', $.extend({}, data, due)).pipe(function (object) {
			var task = new Task(object);
			TaskService.create.fixTasklistReference(task, data.tasklistID, taskdata);
			return task;
		}).done(function (task) {
			taskdata.tasks.push(task);
			taskdata.tasks.remove(mock);
		});
	};
};

TaskService.create.rollbackFunction = function (taskdata, data, mock) {
	return function () {
		return taskdata.tasks.remove(mock);
	};
};

TaskService.create.fixTasklistReference = function (task, tasklistID, taskdata) {
	var tasklist = taskdata.tasklists().filter(function (tasklist) {
		return tasklist.id() == tasklistID;
	})[0];
	task.tasklist(tasklist);
};

/**
 * Update the task.
 * 
 * @param {Task}
 *            task
 * @param {Object}
 *            data
 * @returns {Deferred}
 */
TaskService.update = function (task, data) {
	var transaction = new ServiceTransaction(
			TaskService.update.executeFunction(task, data),
			TaskService.update.rollbackFunction(task, data));

	ko.extendObservables(task, data);

	task.transactions.push(transaction);
	return transaction.promise();
};

TaskService.update.executeFunction = function (task, data) {
	var identity = {
		id: task.id(),
		tasklistID: task.tasklist().id()
	};
	var due = data.due === undefined ? {} : {
		// set due=0 for the ice box
		due: data.due ? DateUtil.calculateTimeInUTC(data.due) : 0
	};
	var request = $.extend(identity, data, due);
	return $.post.bind(null, '/tasks/update', request);
};

TaskService.update.rollbackFunction = function (task, data) {
	var originalData = {};
	$.each(data, function (k, v) {
		originalData[k] = task[k]();
	});
	return ko.extendObservables.bind(null, task, originalData);
};

/**
 * Move the task to another tasklist.
 * 
 * @param {Task}
 *            task
 * @param {Tasklist}
 *            tasklist destination
 * @returns {Deferred}
 */
TaskService.move = function (task, tasklist) {
	var transaction = new ServiceTransaction(
			TaskService.move.executeFunction(task, tasklist),
			TaskService.move.rollbackFunction(task));

	task.tasklist(tasklist);

	task.transactions.push(transaction);
	return transaction.promise();
};

TaskService.move.executeFunction = function (task, tasklist) {
	var request = {
		id: task.id(),
		tasklistID: task.tasklist().id(),
		destinationTasklistID: tasklist.id()
	};
	return $.post.bind(null, '/tasks/move', request);
};

TaskService.move.rollbackFunction = function (task) {
	return task.tasklist.bind(null, task.tasklist());
};

/**
 * Remove the task.
 * 
 * @param {Taskdata}
 *            taskdata
 * @param {Task}
 *            task
 * @returns {Deferred}
 */
TaskService.remove = function (taskdata, task) {
	var transaction = new ServiceTransaction(
			TaskService.remove.executeFunction(taskdata, task),
			TaskService.remove.rollbackFunction(taskdata, task));

	task.transactions.push(transaction);
	return transaction.promise();
};

TaskService.remove.executeFunction = function (taskdata, task) {
	var request = {
		id: task.id(),
		tasklistID: task.tasklist().id()
	};
	return function () {
		return $.post('/tasks/delete', request).done(function () {
			taskdata.tasks.remove(task);
		});
	};
};

TaskService.remove.rollbackFunction = function (taskdata, task) {
	return function () {
		return taskdata.tasks.push(task);
	};
};
