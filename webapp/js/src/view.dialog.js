/**
 * @class Dialog to create a task.
 * @param {Taskdata} taskdata
 * @param {Date} due
 * @param {Event} event
 */
function CreateTaskDialog (taskdata, due, event) {
	this.initialize.apply(this, arguments);
};
/**
 * @param {Taskdata} taskdata
 * @param {Date} due
 * @param {Event} event
 */
CreateTaskDialog.prototype.initialize = function (taskdata, due, event) {
	var self = this;
	this.top = event.pageY + 'px';

	this.due = ko.observable(due);
	this.title = ko.observable();
	this.notes = ko.observable();

	this.titleFocus = ko.observable(true);
	this.tasklists = taskdata.tasklists();
	this.selectedTasklist = ko.observable(this.tasklists[0]);  // select first item
	this.selectTasklist = function (tasklist) {
		self.selectedTasklist(tasklist);
		self.titleFocus(true);
	};

	this.save = function () {
		if (self.title()) {
			Tasks.create({
				tasklistID: self.selectedTasklist().id(),
				due: self.due(),
				title: self.title(),
				notes: self.notes()
			}).done(function (task) {
				task.tasklist(self.selectedTasklist());
				taskdata.tasks.push(task);
				self.dispose();
			});
		}
	};
};
/**
 * This method will be injected by <code>ko.disposableObservable()</code>.
 */
CreateTaskDialog.prototype.dispose = function () {};
/**
 * @class Dialog to update the task.
 */
function UpdateTaskDialog (taskvm, event, tasklists) {
	this.initialize.apply(this, arguments);
};
/**
 * @param {Taskdata} taskdata
 * @param {Task} task
 * @param {Event} event
 */
UpdateTaskDialog.prototype.initialize = function (taskdata, task, event) {
	var self = this;
	this.top = event.pageY + 'px';
	this.task = task;

	this.due = ko.observable(this.task.due());
	this.title = ko.observable(this.task.title());
	this.notes = ko.observable(this.task.notes());
	this.save = function () {
		if (self.title()) {
			task.update({
				due: self.due(),
				title: self.title(),
				notes: self.notes()
			}).done(function () {
				self.dispose();
			});
		}
	};

	this.tasklists = taskdata.tasklists();
	this.selectedTasklist = ko.observable(this.task.tasklist());
	this.originalTasklist = ko.observable(this.task.tasklist());
	this.selectTasklist = function (tasklist) {
		self.selectedTasklist(tasklist);
	};
	this.move = function () {
		self.task.move(self.selectedTasklist()).done(function () {
			self.dispose();
		});
	};

	this.removeConfirmed = ko.observable(false);
	this.confirmRemove = function () {
		self.removeConfirmed(true);
	};
	this.remove = function () {
		self.task.remove().done(function () {
			taskdata.remove(self.task);
			self.dispose();
		});
	};
};
/**
 * This method will be injected by <code>ko.disposableObservable()</code>.
 */
UpdateTaskDialog.prototype.dispose = function () {};
/**
 * @class Dialog to create a tasklist.
 */
function CreateTasklistDialog (taskdata) {
	this.initialize.apply(this, arguments);
};
/**
 * @param {Taskdata} taskdata
 */
CreateTasklistDialog.prototype.initialize = function (taskdata) {
	var self = this;
	this.title = ko.observable();
	this.save = function () {
		if (self.title()) {
			Tasklists.create({
				title: self.title()
			}).done(function (tasklist) {
				taskdata.tasklists.push(tasklist);
				self.dispose();
			});
		}
	};
};
/**
 * This method will be injected by <code>ko.disposableObservable()</code>.
 */
CreateTasklistDialog.prototype.dispose = function () {};
/**
 * @class Dialog to update the tasklist.
 */
function UpdateTasklistDialog (taskdata, tasklist, event) {
	this.initialize.apply(this, arguments);
};
/**
 * @param {Taskdata} taskdata
 * @param {Tasklist} tasklist
 * @param {Event} event
 */
UpdateTasklistDialog.prototype.initialize = function (taskdata, tasklist, event) {
	var self = this;
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
		if (self.title()) {
			self.tasklist.update({
				title: self.title
			});
			self.dispose();
		}
	};

	this.selectedColor = ko.observable(this.tasklist.colorCode());
	this.selectColor = function (colorCode) {
		self.selectedColor(colorCode);
		self.tasklist.updateMetadata({
			colorCode: self.selectedColor
		});
	};

	this.removeConfirmed = ko.observable(false);
	this.confirmRemove = function () {
		self.removeConfirmed(true);
	};
	this.remove = function () {
		self.tasklist.remove().done(function () {
			taskdata.remove(self.tasklist);
			self.dispose();
		});
	};
};
/**
 * This method will be injected by <code>ko.disposableObservable()</code>.
 */
UpdateTasklistDialog.prototype.dispose = function () {};
