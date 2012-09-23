/**
 * @constructor transaction of service operation
 * @param {Function}
 *            operation operation function (must return {Deferred})
 * @param {Function}
 *            rollback rollback function
 * @param {Object}
 *            meta meta data
 */
function ServiceTransaction (operation, rollback, meta) {
	this.meta = meta;

	// signal to start the operation
	this.signal = $.Deferred();

	// deferred for caller (see promise())
	this.responder = $.Deferred();

	this.signal.done(function () {
		operation.call(this)
			.done(this.responder.resolve)
			.fail(this.responder.reject)
			.fail(rollback.bind(this));
	}.bind(this));

	this.signal.fail(function () {
		this.responder.resolve();
		rollback.call(this);
	}.bind(this));
};

/**
 * Register this transaction to the collection.
 * The instance is added to the array at first, and removed when done even if failed.
 * 
 * @param {Array}
 *            transactions Array of transactions
 */
ServiceTransaction.prototype.register = function (transactions) {
	transactions.push(this);
	this.responder.always(function () {
		transactions.remove(this);
	}.bind(this));
};

/**
 * Execute this transaction if on-line, or keep pending if off-line.
 * 
 * <ol>
 * <li>Deferred will be resolved if the operation succeeded.</li>
 * <li>Deferred will be rejected if the operation failed.</li>
 * <li>Deferred will be resolved if <code>rollback()</code> called.</li>
 * </ol>
 * 
 * @returns {Deferred} deferred
 */
ServiceTransaction.prototype.promise = function () {
	if (!taskwalls.settings.offline()) {
		this.signal.resolve();
	}
	return this.responder;
};

/**
 * Execute this transaction.
 * Nothing happen if this transaction is already executed.
 * 
 * @returns {Deferred} deferred
 * @see ServiceTransaction#promise()
 */
ServiceTransaction.prototype.execute = function () {
	this.signal.resolve();
	return this.responder;
};

/**
 * Roll back this transaction.
 * Nothing happen if this transaction is already executed.
 * 
 * @returns {Deferred} deferred
 * @see ServiceTransaction#promise()
 */
ServiceTransaction.prototype.rollback = function () {
	this.signal.reject();
	return this.responder;
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
	return $.getJSON('/tasklists').pipe(function (response, status, xhr) {
		if (response) {
			var items = response.items;
			if ($.isArray(items)) {
				localStorage['tasklists'] = xhr.responseText;
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
		var response = $.parseJSON(localStorage['tasklists']);
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

	transaction.register(mock.transactions);
	return transaction.promise();
};

/**
 * @returns {Function} service operation
 */
TasklistService.create.executeFunction = function (taskdata, data, mock) {
	var request = JSON.stringify(data);
	return function () {
		return $.post('/tasklists', request).pipe(function (object) {
			return new Tasklist(object);
		}).done(function (tasklist) {
			taskdata.tasklists.push(tasklist);
			taskdata.tasklists.remove(mock);
		});
	};
};

/**
 * @returns {Function} rollback the service operation
 */
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

	transaction.register(tasklist.transactions);
	return transaction.promise();
};

/**
 * @returns {Function} service operation
 */
TasklistService.update.executeFunction = function (tasklist, data) {
	var request = JSON.stringify($.extend({
		id: tasklist.id()
	}, data));
	return $.post.bind(null, '/tasklists/update', request);
};

/**
 * @returns {Function} rollback the service operation
 */
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

	transaction.register(tasklist.transactions);
	return transaction.promise();
};

/**
 * @returns {Function} service operation
 */
TasklistService.updateExtension.executeFunction = function (tasklist, data) {
	var request = $.extend({
		id: tasklist.id()
	}, data);
	return $.post.bind(null, '/tasklists/extension/update', request);
};

/**
 * @returns {Function} rollback the service operation
 */
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

	transaction.register(tasklist.transactions);
	return transaction.promise();
};

/**
 * @returns {Function} service operation
 */
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

/**
 * @returns {Function} rollback the service operation
 */
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
	var request = {
		tasklistID: tasklist.id()
	};
	return $.getJSON('/tasks', request).pipe(function (response, status, xhr) {
		if (response) {
			var items = response.items;
			if ($.isArray(items)) {
				localStorage['tasks/' + tasklist.id()] = xhr.responseText;
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
		var response = JSON.parse(localStorage['tasks/' + tasklist.id()]);
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
			TaskService.create.rollbackFunction(taskdata, data, mock),
			{kind: 'create'});

	transaction.register(mock.transactions);
	return transaction.promise();
};

/**
 * @returns {Function} service operation
 */
TaskService.create.executeFunction = function (taskdata, data, mock) {
	var request = JSON.stringify(data);
	return function () {
		return $.post('/tasks', request).pipe(function (object) {
			var task = new Task(object);
			TaskService.create.fixTasklistReference(task, data.tasklistID, taskdata);
			return task;
		}).done(function (task) {
			taskdata.tasks.push(task);
			taskdata.tasks.remove(mock);
		});
	};
};

/**
 * @returns {Function} rollback the service operation
 */
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
			TaskService.update.rollbackFunction(task, data),
			{kind: 'update'});

	ko.extendObservables(task, data);

	transaction.register(task.transactions);
	return transaction.promise();
};

/**
 * @returns {Function} service operation
 */
TaskService.update.executeFunction = function (task, data) {
	var identity = {
		id: task.id(),
		tasklistID: task.tasklist().id()
	};
	var request = JSON.stringify($.extend(identity, data));
	return $.post.bind(null, '/tasks/update', request);
};

/**
 * @returns {Function} rollback the service operation
 */
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
			TaskService.move.rollbackFunction(task),
			{kind: 'move'});

	task.tasklist(tasklist);

	transaction.register(task.transactions);
	return transaction.promise();
};

/**
 * @returns {Function} service operation
 */
TaskService.move.executeFunction = function (task, tasklist) {
	var request = {
		id: task.id(),
		tasklistID: task.tasklist().id(),
		destinationTasklistID: tasklist.id()
	};
	return $.post.bind(null, '/tasks/move', request);
};

/**
 * @returns {Function} rollback the service operation
 */
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
			TaskService.remove.rollbackFunction(taskdata, task),
			{kind: 'remove'});

	transaction.register(task.transactions);
	return transaction.promise();
};

/**
 * @returns {Function} service operation
 */
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

/**
 * @returns {Function} rollback the service operation
 */
TaskService.remove.rollbackFunction = function (taskdata, task) {
	return function () {
		return taskdata.tasks.push(task);
	};
};
