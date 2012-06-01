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
	this.save = function () {
		// TODO: implement this
	};
};
CreateTaskDialog.prototype = new Dialog();
