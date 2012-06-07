/**
 * @class View model for authorized page. 
 */
var AuthorizedPageViewModel = function() {
	// tasks
	this.taskdata = new TaskdataViewModel();
	this.completedCount = ko.computed(function () {
		return $.grep(this.taskdata.tasks(), function (task) {
			return DateUtil.isThisWeek(task.due()) && task.isCompleted();
		}).length;
	}, this);
	this.needsActionCount = ko.computed(function () {
		return $.grep(this.taskdata.tasks(), function (task) {
			return DateUtil.isThisWeek(task.due()) && !task.isCompleted();
		}).length;
	}, this);

	// calendar
	this.calendar = new CalendarViewModel(this.taskdata);
	this.planner = new PlannerViewModel(this.taskdata);

	// dialogs
	this.createTaskDialog = ko.disposableObservable(function (context, event) {
		if (context.date) {
			// context may be CalendarDayViewModel
			return new CreateTaskDialog(context.date(), event, this.taskdata);
		} else {
			// context may be PlannerViewModel
			return new CreateTaskDialog(null, event, this.taskdata);
		}
	}, this);
	this.updateTaskDialog = ko.disposableObservable(function (taskvm, event) {
		return new UpdateTaskDialog(taskvm, event, this.taskdata);
	}, this);
	this.createTasklistDialog = ko.disposableObservable(function () {
		return new CreateTasklistDialog();
	});
	this.updateTasklistDialog = ko.disposableObservable(function (tasklistvm, event) {
		return new UpdateTasklistDialog(tasklistvm, event);
	});

	// offline
	this.offline = AppSettings.offline;
	this.lastCached = AppSettings.lastCached;

	// development only
	this.development = ko.observable(window.location.hostname == 'localhost');

	// load tasks
	this.taskdata.load();
};