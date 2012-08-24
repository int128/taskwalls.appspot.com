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

	// summary
	this.completedCount = ko.computed(function () {
		var today = DateUtil.today();
		return $.grep(this.taskdata.tasks(), function (task) {
			return DateUtil.areSameWeek(task.due(), today) && task.isCompleted();
		}).length;
	}, this);
	this.count = ko.computed(function () {
		var today = DateUtil.today();
		return $.grep(this.taskdata.tasks(), function (task) {
			return DateUtil.areSameWeek(task.due(), today);
		}).length;
	}, this);

	this.tasklists = this.taskdata.tasklists;

	// calendar
	this.viewMode = ko.observable('overview');
	/** @returns {Function} */
	this.switchView = function (name) {
		return function () {
			this.viewMode(name);
		};
	};

	this.overview = new TasksOverviewViewModel(this.taskdata);
	this.dailyCalendar = new DailyCalendarViewModel(this.taskdata);
	this.weeklyCalendar = new WeeklyCalendarViewModel(this.taskdata);
	this.monthlyCalendar = new MonthlyCalendarViewModel(this.taskdata);
	this.iceboxTasks = new IceboxTasksViewModel(this.taskdata);
	this.pastTasks = new PastTasksViewModel(this.taskdata);

	// dialogs
	this.createTaskDialog = ko.disposableObservable(function (row, event) {
		return new CreateTaskDialog(this.taskdata, row.getDayForNewTask(), event);
	}, this);
	this.updateTaskDialog = ko.disposableObservable(function (task, event) {
		return new UpdateTaskDialog(this.taskdata, task, event);
	}, this);
	this.createTasklistDialog = ko.disposableObservable(function () {
		return new CreateTasklistDialog(this.taskdata);
	}, this);
	this.updateTasklistDialog = ko.disposableObservable(function (tasklist, event) {
		return new UpdateTasklistDialog(this.taskdata, tasklist, event);
	}, this);

	// settings
	this.offline = taskwalls.settings.offline;
	this.lastCached = taskwalls.settings.lastCached;
	this.development = taskwalls.settings.development;

	// session
	this.logout = function () {
		OAuth2Controller.logout();
	};
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

	// behave as offline
	this.offline(true);

	// load example data
	$.getJSON('/tryoutdata.json').done($.proxy(function (response) {
		var originTime = DateUtil.calculateFirstDayOfWeek(DateUtil.today()),
			baseTime = DateUtil.clearTimePart(new Date(response.baseTime)).getTime(),
			delta = originTime - baseTime;

		var tasklists = Tasklists.map(response.tasklists.items);
		this.taskdata.tasklists(tasklists);
		var tasks = $.map(Tasks.map(response.tasks.items), function (task) {
			// extract tasklist ID from URL and associate with the instance
			// see {@link Taskdata#load()}
			var p = task.selfLink().split('/'), tasklistID = p[p.length - 3];
			task.tasklist = ko.observable($.grep(tasklists, function (tasklist) {
				return tasklist.id() == tasklistID;
			})[0]);
			// adjust date
			if (task.due()) {
				task.due(new Date(task.due().getTime() + delta));
			}
			return task;
		});
		this.taskdata.tasks(tasks);
	}, this));
};
