/**
 * @class Dialog to create a task.
 * @param {CalendarDayViewModel} dayvm
 * @param {Event} event
 * @param {TaskdataViewModel} taskdata
 */
var CreateTaskDialog = function (dayvm, event, taskdata) {
	var self = this;
	this.top = event.pageY + 'px';
	this.tasklists = taskdata.tasklists;  // observable array

	this.due = ko.observable(dayvm.date());
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
var UpdateTaskDialog = function (taskvm, event, taskdata) {
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
var CreateTasklistDialog = function () {
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
var UpdateTasklistDialog = function (tasklistvm, event) {
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
