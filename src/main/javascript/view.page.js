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

	// misc
	this.settings = taskwalls.settings;
	this.today = ko.computed(function () {
		return new Date(DateUtil.today());
	});
	this.thisWeek = ko.computed(function () {
		return new Date(DateUtil.thisWeek());
	});
	this.lastDayOfThisWeek = ko.computed(function () {
		return new Date(DateUtil.thisWeek() + DateUtil.DAY_UNIT * 6);
	});

	// expired tasks
	var expiredTasks = ko.computed(function () {
		return this.taskdata.tasks()
				.filter(TaskFilters.status('needsAction'))
				.filter(TaskFilters.dueBefore(DateUtil.thisWeek()));
	}, this);
	this.expiredTasksGroups = ko.computed(function () {
		return Tasks.groupByTasklist(expiredTasks());
	});
	this.moveExpiredTasks = function () {
		var due = this.lastDayOfThisWeek();
		expiredTasks().forEach(function (task) {
			TaskService.update(task, {
				due: due
			});
		});
	};

	// pending transactions
	this.pendingTasks = ko.computed(function () {
		return this.taskdata.tasks().filter(function (task) {
			return task.transactions().length > 0;
		});
	}, this);

	// views
	this.viewMode = ko.observable(location.hash);
	this.viewModeIs = FunctionUtil.match(this.viewMode);
	$(window).bind('hashchange', function () {
		this.viewMode(location.hash);
	}.bind(this));

	this.overview = new TasksOverviewViewModel(this.taskdata);
	this.dailyCalendar = new DailyCalendarViewModel(this.taskdata);
	this.weeklyCalendar = new WeeklyCalendarViewModel(this.taskdata);
	this.monthlyCalendar = new MonthlyCalendarViewModel(this.taskdata);
	this.iceboxTasks = new IceboxTasksViewModel(this.taskdata);
	this.pastTasks = new PastTasksViewModel(this.taskdata);

	// dialogs
	this.createTaskDialog = DialogManager(CreateTaskDialog.factory, this.taskdata);
	this.updateTaskDialog = DialogManager(UpdateTaskDialog.factory, this.taskdata);
	this.createTasklistDialog = DialogManager(CreateTasklistDialog.factory, this.taskdata);
	this.updateTasklistDialog = DialogManager(UpdateTasklistDialog.factory, this.taskdata);

	// menus
	this.tasklists = ko.computed(function () {
		return this.taskdata.tasklists().map(function (tasklist) {
			return new TasklistMenuItemViewModel(tasklist);
		});
	}, this);
};

AuthorizedPageViewModel.prototype.load = function () {
	TaskdataService.fetch(this.taskdata);
};

AuthorizedPageViewModel.prototype.toggleOffline = function () {
	taskwalls.settings.offline(!taskwalls.settings.offline());
};

AuthorizedPageViewModel.prototype.logout = function () {
	OAuth2Controller.logout();
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
	taskwalls.settings.offline(true);

	// load example data
	$.getJSON('/tryoutdata.json').done(function (response) {
		var delta = DateUtil.thisWeek() - DateUtil.clearTimePart(new Date(response.baseTime)).getTime();

		var tasklists = response.tasklists.items.map(function (item) {
			return new Tasklist(item);
		});
		this.taskdata.tasklists(tasklists);

		this.taskdata.tasks(response.tasks.items.map(function (item) {
			// extract tasklist ID from URL and associate with the instance
			// see {@link Taskdata#load()}
			var p = item.selfLink.split('/');
			var tasklistID = p[p.length - 3];
			var tasklist = tasklists.filter(function (tasklist) {
				return tasklist.id() == tasklistID;
			})[0];
			return new Task(item, tasklist);
		}).map(function (task) {
			// adjust date
			if (task.due()) {
				task.due(new Date(task.due().getTime() + delta));
			}
			return task;
		}));
	}.bind(this));
};

/**
 * @class item of task lists menu
 */
function TasklistMenuItemViewModel () {
	this.initialize.apply(this, arguments);
};

/**
 * @param {Tasklist} tasklist
 */
TasklistMenuItemViewModel.prototype.initialize = function (tasklist) {
	this.tasklist = tasklist;
	this.colors = this.colorCodeArray.map(function (colorCode) {
		return {
			colorCode: colorCode,
			update: this.updateColor.bind(this, colorCode)
		};
	}.bind(this));
};

TasklistMenuItemViewModel.prototype.updateColor = function (colorCode) {
	TasklistService.updateExtension(this.tasklist, {
		colorCode: colorCode
	});
};

$(function () {
	TasklistMenuItemViewModel.prototype.colorCodeArray = (function () {
		var a = [];
		for (var i = 0; i < taskwalls.settings.tasklistColors; i++) {
			a[i] = i;
		}
		return a;
	})();
});
