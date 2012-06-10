/**
 * @class View model for authorized page. 
 */
function AuthorizedPageViewModel () {
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
			return new CreateTaskDialog(context.date(), event, taskdata.tasklists());
		} else {
			// context may be PlannerViewModel
			return new CreateTaskDialog(null, event, taskdata.tasklists());
		}
	}, this);
	this.updateTaskDialog = ko.disposableObservable(function (taskvm, event) {
		return new UpdateTaskDialog(taskvm, event, taskdata.tasklists());
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

	// asynchronously load
	taskdata.load();
};