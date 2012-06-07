/**
 * @class Dialog to create a task.
 * @param {Date} due
 * @param {Event} event
 * @param {TaskdataViewModel} taskdata
 */
function CreateTaskDialog (due, event, taskdata) {
	var self = this;
	this.top = event.pageY + 'px';
	this.tasklists = taskdata.tasklists;  // observable array

	this.due = ko.observable(due);
	this.title = ko.observable();
	this.notes = ko.observable();
	this.selectedTasklistID = ko.observable(this.tasklists()[0].id());  // select first item

	this.selectTasklist = function (tasklist) {
		self.selectedTasklistID(tasklist.id());
	};

	this.save = function () {
		// TODO: implement this
	};
};
/**
 * @class Dialog to update the task.
 * @param {TaskViewModel} taskvm
 * @param {Event} event
 * @param {TaskdataViewModel} taskdata
 */
function UpdateTaskDialog (taskvm, event, taskdata) {
	var self = this;
	this.top = event.pageY + 'px';
	this.tasklists = taskdata.tasklists;  // observable array

	this.due = ko.observable(taskvm.due());
	this.title = ko.observable(taskvm.title());
	this.notes = ko.observable(taskvm.notes());
	this.selectedTasklistID = ko.observable(taskvm.tasklist().id());
	this.originalTasklistID = ko.observable(taskvm.tasklist().id());
	this.removeConfirmed = ko.observable(false);

	this.save = function () {
		// TODO: implement this
	};

	this.selectTasklist = function (tasklist) {
		self.selectedTasklistID(tasklist.id());
	};

	this.move = function () {
		// TODO: implement this
	};

	this.confirmRemove = function () {
		self.removeConfirmed(true);
	};

	this.remove = function () {
		// TODO: implement this
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

	this.title = ko.observable(tasklistvm.title());
	this.colors = AppSettings.tasklistColorIDs();
	this.selectedColor = ko.observable(tasklistvm.colorID());
	this.removeConfirmed = ko.observable(false);

	this.saveTitle = function () {
		// TODO: persist
	};

	this.selectColor = function (id) {
		// TODO: persist
		self.selectedColor(id);
		self.tasklist.colorID(id);
	};

	this.confirmRemove = function () {
		self.removeConfirmed(true);
	};
	this.remove = function () {
		// TODO: implement this
	};
};
