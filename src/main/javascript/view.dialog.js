/**
 * @class Dialog to create a task.
 * @param {Taskdata}
 *            taskdata
 * @param {Date}
 *            due
 * @param {Event}
 *            event
 */
function CreateTaskDialog (taskdata, due, event) {
	this.initialize.apply(this, arguments);
};

/**
 * @param {Taskdata}
 *            taskdata
 * @param {Date}
 *            due
 * @param {Event}
 *            event
 */
CreateTaskDialog.prototype.initialize = function (taskdata, due, event) {
	this.top = event.pageY + 'px';

	this.due = ko.observable(due);
	this.title = ko.observable();
	this.notes = ko.observable();

	this.titleFocus = ko.observable(true);
	this.tasklists = taskdata.tasklists();
	this.selectedTasklist = ko.observable(this.tasklists[0]); // select first item
	this.selectTasklist = function (tasklist) {
		this.selectedTasklist(tasklist);
		this.titleFocus(true);
	}.bind(this);

	this.save = function () {
		if (this.title()) {
			Tasks.create({
				tasklistID: this.selectedTasklist().id(),
				due: this.due(),
				title: this.title(),
				notes: this.notes()
			}).done(function (task) {
				task.tasklist(this.selectedTasklist());
				taskdata.tasks.push(task);
				this.dispose();
			}.bind(this));
		}
	}.bind(this);
};

/**
 * This method will be injected by <code>ko.disposableObservable()</code>.
 */
CreateTaskDialog.prototype.dispose = function () {
};

/**
 * @class Dialog to update the task.
 */
function UpdateTaskDialog (taskvm, event, tasklists) {
	this.initialize.apply(this, arguments);
};

/**
 * @param {Taskdata}
 *            taskdata
 * @param {Task}
 *            task
 * @param {Event}
 *            event
 */
UpdateTaskDialog.prototype.initialize = function (taskdata, task, event) {
	this.top = event.pageY + 'px';
	this.task = task;

	this.completed = this.task.completed();
	this.isCompleted = this.task.isCompleted();
	this.saveStatus = function (status) {
		task.update({
			status: status
		}).done(function () {
			this.dispose();
		}.bind(this));
	};
	this.saveStatusAs = function (status) {
		return this.saveStatus.bind(this, status);
	}.bind(this);

	this.due = ko.observable(this.task.due());
	this.title = ko.observable(this.task.title());
	this.notes = ko.observable(this.task.notes());
	this.save = function () {
		if (this.title()) {
			task.update({
				due: this.due(),
				title: this.title(),
				notes: this.notes()
			}).done(function () {
				this.dispose();
			}.bind(this));
		}
	}.bind(this);

	this.tasklists = taskdata.tasklists();
	this.selectedTasklist = ko.observable(this.task.tasklist());
	this.originalTasklist = ko.observable(this.task.tasklist());
	this.selectTasklist = function (tasklist) {
		this.selectedTasklist(tasklist);
	}.bind(this);
	this.move = function () {
		this.task.move(this.selectedTasklist()).done(function () {
			this.dispose();
		}.bind(this));
	}.bind(this);

	this.removeConfirmed = ko.observable(false);
	this.confirmRemove = function () {
		this.removeConfirmed(true);
	}.bind(this);
	this.remove = function () {
		this.task.remove().done(function () {
			taskdata.remove(this.task);
			this.dispose();
		}.bind(this));
	}.bind(this);
};

/**
 * This method will be injected by <code>ko.disposableObservable()</code>.
 */
UpdateTaskDialog.prototype.dispose = function () {
};

/**
 * @class Dialog to create a tasklist.
 */
function CreateTasklistDialog (taskdata) {
	this.initialize.apply(this, arguments);
};

/**
 * @param {Taskdata}
 *            taskdata
 */
CreateTasklistDialog.prototype.initialize = function (taskdata) {
	this.title = ko.observable();
	this.save = function () {
		if (this.title()) {
			Tasklists.create({
				title: this.title()
			}).done(function (tasklist) {
				taskdata.tasklists.push(tasklist);
				this.dispose();
			}.bind(this));
		}
	}.bind(this);
};

/**
 * This method will be injected by <code>ko.disposableObservable()</code>.
 */
CreateTasklistDialog.prototype.dispose = function () {
};

/**
 * @class Dialog to update the tasklist.
 */
function UpdateTasklistDialog (taskdata, tasklist, event) {
	this.initialize.apply(this, arguments);
};

/**
 * @param {Taskdata}
 *            taskdata
 * @param {Tasklist}
 *            tasklist
 * @param {Event}
 *            event
 */
UpdateTasklistDialog.prototype.initialize = function (taskdata, tasklist, event) {
	this.top = event.clientY + 'px';
	this.tasklist = tasklist;
	this.colors = (function () {
		// generate color code array
		var a = [];
		for (var i = 0; i < taskwalls.settings.tasklistColors; i++) {
			a[i] = i;
		}
		return a;
	})();

	this.title = ko.observable(this.tasklist.title());
	this.saveTitle = function () {
		if (this.title()) {
			this.tasklist.update({
				title: this.title
			});
			this.dispose();
		}
	}.bind(this);

	this.selectedColor = ko.observable(this.tasklist.colorCode());
	this.selectColor = function (colorCode) {
		this.selectedColor(colorCode);
		this.tasklist.updateMetadata({
			colorCode: this.selectedColor
		});
	}.bind(this);

	this.removeConfirmed = ko.observable(false);
	this.confirmRemove = function () {
		this.removeConfirmed(true);
	}.bind(this);
	this.remove = function () {
		this.tasklist.remove().done(function () {
			taskdata.remove(this.tasklist);
			this.dispose();
		}.bind(this));
	}.bind(this);
};

/**
 * This method will be injected by <code>ko.disposableObservable()</code>.
 */
UpdateTasklistDialog.prototype.dispose = function () {
};
