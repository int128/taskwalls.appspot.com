/**
 * Generate a service function that supports on-line and off-line.
 * 
 * @returns {Function}
 */
function ServiceOperation () {
	var f = undefined;
	f = function () {
		if (taskwalls.settings.offline()) {
			return f.offline.apply(this, arguments);
		} else {
			return f.online.apply(this, arguments);
		}
	};
	return f;
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
TasklistService.fetch = ServiceOperation();

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
 * Create a tasklist.
 * 
 * @param {Taskdata}
 *            taskdata
 * @param {Object}
 *            data
 * @returns {Deferred} call with new instance of {@link Tasklist}
 */
TasklistService.create = ServiceOperation();

TasklistService.create.online = function (taskdata, data) {
	return $.post('/tasklists/create', data).pipe(function (object) {
		return new Tasklist(object);
	}).done(function (tasklist) {
		taskdata.tasklists.push(tasklist);
	});
};

TasklistService.create.offline = function (taskdata, data) {
	return $.Deferred().resolve(new Tasklist($.extend({
		id: 'tasklist__' + $.now()
	}, data))).done(function (tasklist) {
		taskdata.tasklists.push(tasklist);
	});
};

/**
 * Save and update myself if succeeded.
 * 
 * @param {Tasklist}
 *            tasklist
 * @param {Object}
 *            data
 * @returns {Deferred}
 */
TasklistService.update = ServiceOperation();

TasklistService.update.online = function (tasklist, data) {
	var request = $.extend({
		id: tasklist.id()
	}, data);
	return $.post('/tasklists/update', request).done(function () {
		ko.extendObservables(tasklist, data);
	}).fail(function () {
		ko.extendObservables(data, tasklist);
	});
};

TasklistService.update.offline = function (tasklist, data) {
	ko.extendObservables(tasklist, data);
	return $.Deferred().resolve();
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
TasklistService.updateExtension = ServiceOperation();

TasklistService.updateExtension.online = function (tasklist, data) {
	var request = $.extend({
		id: tasklist.id()
	}, data);
	return $.post('/tasklists/extension/update', request).done(function () {
		ko.extendObservables(tasklist, data);
	}).fail(function () {
		ko.extendObservables(data, tasklist);
	});
};

TasklistService.updateExtension.offline = function (tasklist, data) {
	ko.extendObservables(tasklist, data);
	return $.Deferred().resolve();
};

/**
 * Remove myself.
 * 
 * @param {Taskdata}
 *            taskdata
 * @param {Tasklist}
 *            tasklist
 * @returns {Deferred}
 */
TasklistService.remove = ServiceOperation();

TasklistService.remove.online = function (taskdata, tasklist) {
	return $.post('/tasklists/delete', {
		id: tasklist.id()
	}).done(function () {
		taskdata.remove(tasklist);
	});
};

TasklistService.remove.offline = function (taskdata, tasklist) {
	taskdata.remove(tasklist);
	return $.Deferred().resolve();
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
TaskService.fetch = ServiceOperation();

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
TaskService.create = ServiceOperation();

TaskService.create.online = function (taskdata, data) {
	return $.post('/tasks/create', $.extend({}, data, {
		// specify zero for icebox
		due: data.due ? DateUtil.calculateTimeInUTC(data.due) : 0
	})).pipe(function (object) {
		var task = new Task(object);
		TaskService.create.fixTasklistReference(task, data, taskdata);
		return task;
	}).done(function (task) {
		taskdata.tasks.push(task);
	});
};

TaskService.create.offline = function (taskdata, data) {
	var task = new Task($.extend({
		id: 'task__' + $.now(),
		status: 'needsAction'
	}, data));
	TaskService.create.fixTasklistReference(task, data, taskdata);
	taskdata.tasks.push(task);
	return $.Deferred().resolve(task);
};

TaskService.create.fixTasklistReference = function (task, data, taskdata) {
	var tasklist = taskdata.tasklists().filter(function (tasklist) {
		return tasklist.id() == data.tasklistID;
	})[0];
	task.tasklist(tasklist);
};

/**
 * Save and update myself if succeeded.
 * 
 * @param {Task}
 *            task
 * @param {Object}
 *            data
 * @returns {Deferred}
 */
TaskService.update = ServiceOperation();

TaskService.update.online = function (task, data) {
	var request = $.extend({}, data, {
		id: task.id(),
		tasklistID: task.tasklist().id(),
	}, data.due === undefined ? {} : {
		// specify zero if for icebox
		due: data.due ? DateUtil.calculateTimeInUTC(data.due) : 0
	});
	return $.post('/tasks/update', request).done(function () {
		ko.extendObservables(task, data);
	}).fail(function () {
		ko.extendObservables(data, task);
	});
};

TaskService.update.offline = function (task, data) {
	return $.Deferred().done(function () {
		ko.extendObservables(task, data);
	}).resolve();
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
TaskService.move = ServiceOperation();

TaskService.move.online = function (task, tasklist) {
	var request = {
		id: task.id(),
		tasklistID: task.tasklist().id(),
		destinationTasklistID: tasklist.id()
	};
	return $.post('/tasks/move', request).done(function () {
		task.tasklist(tasklist);
	});
};

TaskService.move.offline = function (task, tasklist) {
	return $.Deferred().done(function () {
		task.tasklist(tasklist);
	}).resolve();
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
TaskService.remove = ServiceOperation();

TaskService.remove.online = function (taskdata, task) {
	return $.post('/tasks/delete', {
		id: task.id(),
		tasklistID: task.tasklist().id()
	}).done(function () {
		taskdata.remove(task);
	});
};

TaskService.remove.offline = function (taskdata, task) {
	taskdata.remove(task);
	return $.Deferred().resolve();
};
