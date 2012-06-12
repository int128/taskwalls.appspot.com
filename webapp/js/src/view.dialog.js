/**
 * @class Dialog to create a task.
 */
function CreateTaskDialog (due, event, tasklists) {
	this.initialize.apply(this, arguments);
};
/**
 * @param {Date} due
 * @param {Event} event
 * @param {Array} tasklists pass as array (not ko.observableArray)
 */
CreateTaskDialog.prototype.initialize = function (due, event, tasklists) {
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
 */
function UpdateTaskDialog (taskvm, event, tasklists) {
	this.initialize.apply(this, arguments);
};
/**
 * @param {TaskViewModel} taskvm
 * @param {Event} event
 * @param {Array} tasklists pass as array (not ko.observableArray)
 */
UpdateTaskDialog.prototype.initialize = function (taskvm, event, tasklists) {
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
	this.initialize.apply(this, arguments);
};
/**
 */
CreateTasklistDialog.prototype.initialize = function () {
	this.title = ko.observable();
	this.save = function () {
		// TODO: persist
	};
};
/**
 * @class Dialog to update the tasklist.
 */
function UpdateTasklistDialog (tasklistvm, event) {
	this.initialize.apply(this, arguments);
};
/**
 * @param {TasklistViewModel} tasklistvm
 * @param {Event} event
 */
UpdateTasklistDialog.prototype.initialize = function (tasklistvm, event) {
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

	this.title = ko.observable(this.tasklist.title());
	this.saveTitle = function () {
		if (self.title()) {
			self.tasklist.update({
				title: self.title
			});
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
		// TODO: sync model and view
//		self.tasklist.remove().done(function () {
//		});
	};
};
