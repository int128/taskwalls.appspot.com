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
	this.createTaskDialog = new CreateTaskDialog(this.taskdata);
	this.updateTaskDialog = new UpdateTaskDialog(this.taskdata);
	this.updateTasklistDialog = new UpdateTasklistDialog();
	this.createTasklistDialog = new CreateTasklistDialog();

	// offline
	this.offline = AppSettings.offline;
	this.lastCached = AppSettings.lastCached;

	// development only
	this.development = ko.observable(window.location.hostname == 'localhost');

	// load tasks
	this.taskdata.load();
};