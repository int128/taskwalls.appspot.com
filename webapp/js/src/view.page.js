/**
 * @class View model for authorized page. 
 */
function AuthorizedPageViewModel () {
	this.initialize.apply(this, arguments);
};
/**
 */
AuthorizedPageViewModel.prototype.initialize = function () {
	var taskdata = new Taskdata();

	// toggle
	this.completedCount = ko.computed(function () {
		return $.grep(taskdata.tasks(), function (task) {
			return DateUtil.isThisWeek(task.due()) && task.isCompleted();
		}).length;
	}, this);
	this.needsActionCount = ko.computed(function () {
		return $.grep(taskdata.tasks(), function (task) {
			return DateUtil.isThisWeek(task.due()) && !task.isCompleted();
		}).length;
	}, this);

	// calendar
	this.calendar = new CalendarViewModel(taskdata);
	this.planner = new PlannerViewModel(taskdata);

	// dialogs
	this.createTaskDialog = ko.disposableObservable(function (context, event) {
		if (context.date) {
			// context may be CalendarDayViewModel
			return new CreateTaskDialog(taskdata, context.date(), event);
		} else {
			// context may be PlannerViewModel
			return new CreateTaskDialog(taskdata, null, event);
		}
	}, this);
	this.updateTaskDialog = ko.disposableObservable(function (taskvm, event) {
		return new UpdateTaskDialog(taskdata, taskvm, event);
	}, this);
	this.createTasklistDialog = ko.disposableObservable(function () {
		return new CreateTasklistDialog(taskdata);
	});
	this.updateTasklistDialog = ko.disposableObservable(function (tasklistvm, event) {
		return new UpdateTasklistDialog(taskdata, tasklistvm, event);
	});

	// offline
	this.offline = taskwalls.settings.offline;
	this.lastCached = taskwalls.settings.lastCached;

	// session
	this.logout = taskwalls.session.logout;

	// development only
	this.development = ko.observable(window.location.hostname == 'localhost');

	// asynchronously load
	taskdata.load();
};