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
	this.iceboxTasks = new IceboxTasksViewModel(this.taskdata);
	this.dailyCalendar = new DailyCalendarViewModel(this.taskdata);
	this.weeklyCalendar = new WeeklyCalendarViewModel(this.taskdata);
	this.monthlyCalendar = new MonthlyCalendarViewModel(this.taskdata);

	this.calendarUnit = ko.observable('daily');
	this.switchView = function (name) {
		return function () {
			this.calendarUnit(name);
		};
	};

	this.tasklists = ko.computed(function () {
		return TasklistViewModel.extend(this.taskdata.tasklists());
	}, this);

	// dialogs
	this.createTaskDialog = ko.disposableObservable(function (context, event) {
		if (context.date) {
			// context may be CalendarDayViewModel
			return new CreateTaskDialog(this.taskdata, context.date, event);
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
	}, this);
	this.updateTasklistDialog = ko.disposableObservable(function (tasklist, event) {
		return new UpdateTasklistDialog(this.taskdata, tasklist, event);
	}, this);

	// settings
	this.offline = taskwalls.settings.offline;
	this.lastCached = taskwalls.settings.lastCached;
	this.development = taskwalls.settings.development;

	// session
	this.logout = taskwalls.session.logout;
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
		var originTime = taskwalls.settings.today().getFirstDayOfWeek().getTime(),
			baseTime = DateUtil.normalize(new Date(response.baseTime)).getTime(),
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
