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

	// offline
	this.offline = ko.computed({
		read : function() {
			return AppSettings.isOffline();
		},
		write : function(value) {
			AppSettings.setOffline(value);
		}
	});
	this.lastCached = ko.observable(AppSettings.getCachedDate('Tasklists.get'));

	// development only
	this.development = ko.observable(window.location.hostname == 'localhost');

	// load tasks
	this.taskdata.load();
};