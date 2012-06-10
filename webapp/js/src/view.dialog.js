/**
 * @class Dialog to create a task.
 * @param {Date} due
 * @param {Event} event
 * @param {Array} tasklists pass as array (not ko.observableArray)
 */
function CreateTaskDialog (due, event, tasklists) {
	var self = this;
	this.top = event.pageY + 'px';
	this.tasklists = tasklists;

	this.due = ko.observable(due);
	this.title = ko.observable();
	this.notes = ko.observable();
	this.selectedTasklistID = ko.observable(this.tasklists[0].id());  // select first item

	this.selectTasklist = function (tasklist) {
		self.selectedTasklistID(tasklist.id());
	};

	this.save = function () {
		// TODO: persist
	};
};
/**
 * @class Dialog to update the task.
 * @param {TaskViewModel} taskvm
 * @param {Event} event
 * @param {Array} tasklists pass as array (not ko.observableArray)
 */
function UpdateTaskDialog (taskvm, event, tasklists) {
	var self = this;
	this.top = event.pageY + 'px';
	this.tasklists = tasklists;

	this.due = ko.observable(taskvm.due());
	this.title = ko.observable(taskvm.title());
	this.notes = ko.observable(taskvm.notes());
	this.selectedTasklistID = ko.observable(taskvm.tasklist().id());
	this.originalTasklistID = ko.observable(taskvm.tasklist().id());
	this.removeConfirmed = ko.observable(false);

	this.save = function () {
		// TODO: persist
	};

	this.selectTasklist = function (tasklist) {
		self.selectedTasklistID(tasklist.id());
	};

	this.move = function () {
		// TODO: persist
	};

	this.confirmRemove = function () {
		self.removeConfirmed(true);
	};

	this.remove = function () {
		// TODO: persist
	};
};
/**
 * @class Dialog to create a tasklist.
 */
function CreateTasklistDialog () {
	this.title = ko.observable();
	this.save = function () {
		// TODO: persist
	};
};
/**
 * @class Dialog to update the tasklist.
 * @param {TasklistViewModel} tasklistvm
 * @param {Event} event
 */
function UpdateTasklistDialog (tasklistvm, event) {
	var self = this;
	this.top = event.clientY + 'px';
	this.tasklist = tasklistvm;
	this.colors = (function () {
		// generate color code array
		var a = [];
		for (var i = 0; i < AppSettings.tasklistColors; i++) {
			a[i] = i;
		}
		return a;
	})();

	this.title = ko.observable(tasklistvm.title());
	this.selectedColor = ko.observable(tasklistvm.colorCode());
	this.removeConfirmed = ko.observable(false);

	this.saveTitle = function () {
		// TODO: persist
	};

	this.selectColor = function (colorCode) {
		self.selectedColor(colorCode);
		self.tasklist.colorCode(colorCode);
	};

	this.confirmRemove = function () {
		self.removeConfirmed(true);
	};
	this.remove = function () {
		// TODO: persist
	};
};
