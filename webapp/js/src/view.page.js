/**
 * @class View model for authorized page. 
 */
function AuthorizedPageViewModel () {
	this.initialize.apply(this, arguments);
};
/**
 */
AuthorizedPageViewModel.prototype.initialize = function () {
	this.taskdata = new Taskdata();

	// toggle
	this.completedCount = ko.computed(function () {
		return $.grep(this.taskdata.tasks(), function (task) {
			return DateUtil.isThisWeek(task.due()) && task.isCompleted();
		}).length;
	}, this);
	this.count = ko.computed(function () {
		return $.grep(this.taskdata.tasks(), function (task) {
			return DateUtil.isThisWeek(task.due());
		}).length;
	}, this);

	// calendar
	this.calendar = new CalendarViewModel(this.taskdata);

	// dialogs
	this.createTaskDialog = ko.disposableObservable(function (context, event) {
		if (context.date) {
			// context may be CalendarDayViewModel
			return new CreateTaskDialog(this.taskdata, context.date(), event);
		} else {
			// context may be CalendarIceboxViewModel
			return new CreateTaskDialog(this.taskdata, null, event);
		}
	}, this);
	this.updateTaskDialog = ko.disposableObservable(function (task, event) {
		return new UpdateTaskDialog(this.taskdata, task, event);
	}, this);
	this.createTasklistDialog = ko.disposableObservable(function () {
		return new CreateTasklistDialog(this.taskdata);
	});
	this.updateTasklistDialog = ko.disposableObservable(function (tasklist, event) {
		return new UpdateTasklistDialog(this.taskdata, tasklist, event);
	});

	// offline
	this.offline = taskwalls.settings.offline;
	this.lastCached = taskwalls.settings.lastCached;

	// session
	this.logout = taskwalls.session.logout;

	// development only
	this.development = ko.observable(window.location.hostname == 'localhost');
};
/**
 * Load task data.
 */
AuthorizedPageViewModel.prototype.load = function () {
	this.taskdata.load();
};
/**
 * @class View model for try out box in the unauthorized page. 
 */
function TryOutPageViewModel () {
	this.initialize.apply(this, arguments);
};
/**
 */
TryOutPageViewModel.prototype.initialize = function () {
	this.prototype = new AuthorizedPageViewModel();
	this.prototype.initialize.apply(this, arguments);
};
