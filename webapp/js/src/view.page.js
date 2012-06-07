var AuthorizedPageViewModel = function() {
	// tasks
	this.taskdata = new TaskdataViewModel();
	this.completedCount = ko.computed(function () {
		return $.grep(this.taskdata.tasks(), function (task) {
			return DateUtil.isThisWeek(task.due()) && task.completed();
		}).length;
	}, this);
	this.needsActionCount = ko.computed(function () {
		return $.grep(this.taskdata.tasks(), function (task) {
			return DateUtil.isThisWeek(task.due()) && !task.completed();
		}).length;
	}, this);

	// calendar
	this.calendar = new CalendarViewModel(this.taskdata);

	// dialogs
	this.createTaskDialog = disposableObservable(function (dayvm, event) {
		return new CreateTaskDialog(dayvm, event, this.taskdata);
	}, this);
	this.updateTaskDialog = disposableObservable(function (taskvm, event) {
		return new UpdateTaskDialog(taskvm, event, this.taskdata);
	}, this);
	this.createTasklistDialog = disposableObservable(function () {
		return new CreateTasklistDialog();
	});
	this.updateTasklistDialog = disposableObservable(function (tasklistvm, event) {
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