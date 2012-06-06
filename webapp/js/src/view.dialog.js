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
/**
 * Dialog to create a tasklist.
 * @class CreateTasklistDialog
 */
var CreateTasklistDialog = function () {
	var self = this;
	this.title = ko.observable();
	this.open = function () {
		self.title(null);
		self.visible(true);
	};
	this.save = function () {
		// TODO: persist
	};
};
CreateTasklistDialog.prototype = new Dialog();
/**
 * Updating the tasklist dialog.
 * @constructor {@link UpdateTasklistDialog}
 */
var UpdateTasklistDialog = function () {
	var self = this;
	this.top = ko.observable();
	this.tasklist = ko.observable();

	// edit
	this.title = ko.observable();
	this.saveTitle = function () {
		// TODO: persist
	};

	// change color
	this.colors = AppSettings.tasklistColorIDs();
	this.selectedColor = ko.observable();
	this.selectColor = function (id) {
		// TODO: persist
		self.selectedColor(id);
		self.tasklist().colorID(id);
	};

	// remove
	this.removeConfirmed = ko.observable();
	/**
	 * Confirm to remove the tasklist.
	 */
	this.confirmRemove = function () {
		self.removeConfirmed(true);
	};
	/**
	 * Remove the tasklist.
	 */
	this.remove = function () {
		// TODO: implement this
	};

	/**
	 * Open the dialog.
	 * @param {TasklistViewModel} tasklistvm
	 * @param {Event} event
	 */
	this.open = function (tasklistvm, event) {
		self.tasklist(tasklistvm);
		self.title(tasklistvm.title());
		self.selectedColor(tasklistvm.colorID());
		self.top(event.clientY + 'px');
		self.removeConfirmed(false);
		self.visible(true);
	};
};
UpdateTasklistDialog.prototype = new Dialog();
