/**
 * @class View model for authorized page. 
 */
function AuthorizedPageViewModel () {
	// task data
	var taskdata = new Taskdata();
	var taskdatavm = new TaskdataViewModel(taskdata);

	// toggle
	this.tasklists = taskdatavm.tasklists;
	this.completedCount = ko.computed(function () {
		return $.grep(taskdatavm.tasks(), function (task) {
			return DateUtil.isThisWeek(task.due()) && task.isCompleted();
		}).length;
	}, this);
	this.needsActionCount = ko.computed(function () {
		return $.grep(taskdatavm.tasks(), function (task) {
			return DateUtil.isThisWeek(task.due()) && !task.isCompleted();
		}).length;
	}, this);

	// calendar
	this.calendar = new CalendarViewModel(taskdatavm);
	this.planner = new PlannerViewModel(taskdatavm);

	// dialogs
	this.createTaskDialog = ko.disposableObservable(function (context, event) {
		if (context.date) {
			// context may be CalendarDayViewModel
			return new CreateTaskDialog(context.date(), event, taskdatavm.tasklists());
		} else {
			// context may be PlannerViewModel
			return new CreateTaskDialog(null, event, taskdatavm.tasklists());
		}
	}, this);
	this.updateTaskDialog = ko.disposableObservable(function (taskvm, event) {
		return new UpdateTaskDialog(taskvm, event, taskdatavm.tasklists());
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