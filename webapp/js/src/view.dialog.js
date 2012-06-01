/**
 * @class abstract dialog class
 */
var Dialog = function () {
	var self = this;
	this.visible = ko.observable(false);
	/**
	 * Close the dialog.
	 */
	this.close = function () {
		self.visible(false);
	};
};
/**
 * Creating task dialog.
 * @param {TaskdataViewModel} taskdata
 */
var CreateTaskDialog = function (taskdata) {
	var self = this;
	this.top = ko.observable();
	this.due = ko.observable();
	this.title = ko.observable();
	this.notes = ko.observable();
	this.tasklists = taskdata.tasklists;  // observable array
	this.selectedTasklistID = ko.observable();
	/**
	 * Select the tasklist.
	 * @param {TasklistViewModel} tasklist
	 */
	this.selectTasklist = function (tasklist) {
		self.selectedTasklistID(tasklist.id());
	};
	this.save = function () {
		// TODO: implement this
	};
	/**
	 * Open the dialog.
	 * @param {CalendarDayViewModel} dayvm
	 * @param {Event} event
	 */
	this.open = function (dayvm, event) {
		// select first item of tasklists
		self.selectedTasklistID(self.tasklists()[0].id());
		self.top(event.pageY + 'px');
		self.due(dayvm.date());
		self.visible(true);
	};
};
CreateTaskDialog.prototype = new Dialog();
/**
 * Updating task dialog.
 * @param {TaskdataViewModel} taskdata
 */
var UpdateTaskDialog = function (taskdata) {
	var self = this;
	this.top = ko.observable();
	this.due = ko.observable();
	this.title = ko.observable();
	this.notes = ko.observable();
	this.save = function () {
		// TODO: implement this
	};

	this.tasklists = taskdata.tasklists;  // observable array
	this.selectedTasklistID = ko.observable();
	this.originalTasklistID = ko.observable();
	/**
	 * Select the tasklist.
	 * @param {TasklistViewModel} tasklist
	 */
	this.selectTasklist = function (tasklist) {
		self.selectedTasklistID(tasklist.id());
	};
	/**
	 * Move the task to selected tasklist.
	 */
	this.move = function () {
		// TODO: implement this
	};

	this.removeConfirmed = ko.observable();
	/**
	 * Confirm to remove the task.
	 */
	this.confirmRemove = function () {
		self.removeConfirmed(true);
	};
	/**
	 * Remove the task.
	 */
	this.remove = function () {
		// TODO: implement this
	};

	/**
	 * Open the dialog.
	 * @param {TaskViewModel} task
	 * @param {Event} event
	 */
	this.open = function (task, event) {
		// FIXME: should not depend on the view
		if (!$(event.target).hasClass('task')) {
			return true;
		}
		// select first item of tasklists
		self.selectedTasklistID(task.tasklist().id());
		self.originalTasklistID(task.tasklist().id());
		self.top(event.pageY + 'px');
		self.title(task.title());
		self.notes(task.notes());
		self.due(task.due());
		self.visible(true);
		self.removeConfirmed(false);
	};
};
UpdateTaskDialog.prototype = new Dialog();
