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
 */
var CreateTaskDialog = function () {
	var self = this;
	this.top = ko.observable();
	this.due = ko.observable();
	this.title = ko.observable();
	this.notes = ko.observable();
	this.save = function () {
		// TODO: implement this
	};
	/**
	 * Open the dialog.
	 * @param {CalendarDayViewModel} dayvm
	 * @param {Event} event
	 */
	this.open = function (dayvm, event) {
		self.visible(true);
		self.top(event.pageY + 'px');
		self.due(dayvm.date());
	};
};
CreateTaskDialog.prototype = new Dialog();
