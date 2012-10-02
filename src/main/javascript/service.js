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
 * @class service end point
 * @param {UriTemplate} uriTemplate
 */
function ServiceEndpoint (uriTemplate) {
	this.uriTemplate = uriTemplate;
}

/**
 * Perform a GET request.
 * 
 * @param {Object} parameters parameters for the URI template
 * @returns {Deferred}
 */
ServiceEndpoint.prototype.get = function (parameters) {
	return jQuery.ajax({
		type: 'get',
		url: this.uriTemplate.expand(parameters),
		dataType: 'json'
	});
};

/**
 * Perform a POST request.
 * 
 * @param {Object} parameters parameters for the URI template
 * @param {Object} data request body (encoded as query parameters)
 * @returns {Deferred}
 */
ServiceEndpoint.prototype.post = function (parameters, data) {
	return jQuery.ajax({
		type: 'post',
		data: data,
		url: this.uriTemplate.expand(parameters),
		dataType: 'json'
	});
};

/**
 * Perform a POST request.
 * 
 * @param {Object} parameters parameters for the URI template
 * @param {Object} data request body (encoded as JSON string)
 * @returns {Deferred}
 */
ServiceEndpoint.prototype.postJSON = function (parameters, data) {
	return jQuery.ajax({
		type: 'post',
		contentType: 'application/json; Charset=UTF-8',
		data: JSON.stringify(data),
		url: this.uriTemplate.expand(parameters),
		dataType: 'json'
	});
};

/**
 * Perform a PUT request.
 * 
 * @param {Object} parameters parameters for the URI template
 * @param {Object} data request body (encoded as query parameters)
 * @returns {Deferred}
 */
ServiceEndpoint.prototype.put = function (parameters, data) {
	return jQuery.ajax({
		type: 'put',
		data: data,
		url: this.uriTemplate.expand(parameters),
		dataType: 'json'
	});
};

/**
 * Perform a PUT request.
 * 
 * @param {Object} parameters parameters for the URI template
 * @param {Object} data request body (encoded as JSON string)
 * @returns {Deferred}
 */
ServiceEndpoint.prototype.putJSON = function (parameters, data) {
	return jQuery.ajax({
		type: 'put',
		contentType: 'application/json; Charset=UTF-8',
		data: JSON.stringify(data),
		url: this.uriTemplate.expand(parameters),
		dataType: 'json'
	});
};

/**
 * Perform a DELETE request.
 * 
 * @param {Object} parameters parameters for the URI template
 * @returns {Deferred}
 */
ServiceEndpoint.prototype.delete_ = function (parameters) {
	return jQuery.ajax({
		type: 'delete',
		url: this.uriTemplate.expand(parameters),
		dataType: 'json'
	});
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

TasklistService.endpoints = {
		aggregate: new ServiceEndpoint(UriTemplate.parse('/tasklists/')),
		single: new ServiceEndpoint(UriTemplate.parse('/tasklists/{tasklistID}')),
		extension: new ServiceEndpoint(UriTemplate.parse('/tasklists/{tasklistID}/extension'))
};

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
	return TasklistService.endpoints.aggregate.get().pipe(function (response, status, xhr) {
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
		var response = JSON.parse(localStorage['tasklists']);
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
			function () {
				return TasklistService.endpoints.aggregate.postJSON(null, data).pipe(function (response) {
					return new Tasklist(response);
				}).done(function (tasklist) {
					taskdata.tasklists.push(tasklist);
					taskdata.tasklists.remove(mock);
				});
			},
			function () {
				taskdata.tasklists.remove(mock);
			});
	transaction.register(mock.transactions);
	return transaction.promise();
};

/**
 * Update the task list.
 * 
 * @param {Tasklist}
 *            tasklist
 * @param {Object}
 *            data
 * @returns {Deferred} call with updated {@link Tasklist}
 */
TasklistService.update = function (tasklist, data) {
	var originalData = {};
	$.each(data, function (k, v) {
		originalData[k] = tasklist[k]();
	});
	ko.extendObservables(tasklist, data);

	var transaction = new ServiceTransaction(
			function () {
				return TasklistService.endpoints.single.putJSON({
					tasklistID: tasklist.id()
				}, data);
			},
			function () {
				ko.extendObservables(tasklist, originalData);
			});
	transaction.register(tasklist.transactions);
	return transaction.promise();
};

/**
 * Update extension data of the task list.
 * 
 * @param {Tasklist}
 *            tasklist
 * @param {Object}
 *            data
 * @returns {Deferred}
 */
TasklistService.updateExtension = function (tasklist, data) {
	var originalData = {};
	$.each(data, function (k, v) {
		originalData[k] = tasklist[k]();
	});
	ko.extendObservables(tasklist, data);

	var transaction = new ServiceTransaction(
			function () {
				return TasklistService.endpoints.extension.put({
					tasklistID: tasklist.id()
				}, data);
			},
			function () {
				ko.extendObservables(tasklist, originalData);
			});
	transaction.register(tasklist.transactions);
	return transaction.promise();
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
			function () {
				return TasklistService.endpoints.single.delete_({
					tasklistID: tasklist.id()
				}).done(function () {
					taskdata.tasklists.remove(tasklist);
				});
			},
			$.noop);
	transaction.register(tasklist.transactions);
	return transaction.promise();
};

/**
 * @class service class for {@link Task}
 */
function TaskService () {
};
TaskService.prototype = {};

TaskService.endpoints = {
		aggregate: new ServiceEndpoint(UriTemplate.parse('/tasklists/{tasklistID}/tasks/')),
		single: new ServiceEndpoint(UriTemplate.parse('/tasklists/{tasklistID}/tasks/{id}')),
		move: new ServiceEndpoint(UriTemplate.parse('/tasklists/{tasklistID}/tasks/{id}/move{?to}'))
};

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
	return TaskService.endpoints.aggregate.get({
		tasklistID: tasklist.id()
	}).pipe(function (response, status, xhr) {
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
			function () {
				// FIXME: calculate UTC time
				return TaskService.endpoints.aggregate.postJSON({
					tasklistID: data.tasklistID
				}, data).pipe(function (response) {
					var task = new Task(response);
					TaskService.create.fixTasklistReference(task, data.tasklistID, taskdata);
					return task;
				}).done(function (task) {
					taskdata.tasks.push(task);
					taskdata.tasks.remove(mock);
				});
			},
			function () {
				taskdata.tasks.remove(mock);
			},
			{kind: 'create'});
	transaction.register(mock.transactions);
	return transaction.promise();
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
	var originalData = {};
	$.each(data, function (k, v) {
		originalData[k] = task[k]();
	});
	ko.extendObservables(task, data);

	var transaction = new ServiceTransaction(
			function () {
				// FIXME: calculate UTC time
				return TaskService.endpoints.single.putJSON({
					id: task.id(),
					tasklistID: task.tasklist().id()
				}, data);
			},
			function () {
				ko.extendObservables(task, originalData);
			},
			{kind: 'update'});
	transaction.register(task.transactions);
	return transaction.promise();
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
	var originalTasklist = task.tasklist();
	task.tasklist(tasklist);

	var transaction = new ServiceTransaction(
			function () {
				return TaskService.endpoints.move.post({
					id: task.id(),
					tasklistID: originalTasklist.id(),
					to: tasklist.id()
				});
			},
			function () {
				task.tasklist(originalTasklist);
			},
			{kind: 'move'});
	transaction.register(task.transactions);
	return transaction.promise();
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
			function () {
				return TaskService.endpoints.single.delete_({
					id: task.id(),
					tasklistID: task.tasklist().id()
				}).done(function () {
					taskdata.tasks.remove(task);
				});
			},
			$.noop,
			{kind: 'remove'});
	transaction.register(task.transactions);
	return transaction.promise();
};
