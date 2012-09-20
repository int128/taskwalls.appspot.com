/**
 * @class overview of tasks
 * @param {Taskdata}
 *            taskdata
 */
function TasksOverviewViewModel (taskdata) {
	this.initialize.apply(this, arguments);
};

/**
 * @param {Taskdata}
 *            taskdata
 */
TasksOverviewViewModel.prototype.initialize = function (taskdata) {
	var tasksInThisWeek = ko.computed(function () {
		var dueIndex = taskdata.dueIndex();
		return Array.prototype.concat.apply([],
				DateUtil.arrayOfDays(DateUtil.thisWeek(), 7, function (time) {
					return dueIndex.getTasks(time);
				}));
	});
	this.completed = new TasksOverviewViewModel.Completed(tasksInThisWeek);
	this.needsAction = new TasksOverviewViewModel.NeedsAction(tasksInThisWeek);
};

/**
 * @class represents completed tasks in this week
 * @param tasksInThisWeek
 *            observable array
 */
TasksOverviewViewModel.Completed = function (tasksInThisWeek) {
	this.initialize.apply(this, arguments);
};

TasksOverviewViewModel.Completed.prototype.initialize = function (tasksInThisWeek) {
	this.tasks = ko.computed(function () {
		return tasksInThisWeek().filter(TaskFilters.status('completed'));
	});
	this.tasklists = ko.computed(function () {
		return Tasks.groupByTasklist(this.tasks());
	}, this);
};

/**
 * @param {Task}
 *            task dropped task
 */
TasksOverviewViewModel.Completed.prototype.dropped = function (task) {
	TaskService.update(task, {
		status: 'completed'
	});
};

/**
 * @class represents needsAction tasks in this week
 * @param tasksInThisWeek
 *            observable array
 */
TasksOverviewViewModel.NeedsAction = function (tasksInThisWeek) {
	this.initialize.apply(this, arguments);
};

TasksOverviewViewModel.NeedsAction.prototype.initialize = function (tasksInThisWeek) {
	this.tasks = ko.computed(function () {
		return tasksInThisWeek().filter(TaskFilters.status('needsAction'));
	});
	this.tasklists = ko.computed(function () {
		return Tasks.groupByTasklist(this.tasks());
	}, this);
};

/**
 * @param {Task}
 *            task dropped task
 */
TasksOverviewViewModel.NeedsAction.prototype.dropped = function (task) {
	TaskService.update(task, {
		status: 'needsAction'
	});
};

/**
 * @class abstract row of calendar
 * @param {Number}
 *            time time of the row
 */
function CalendarRow (time) {
	this.initialize.apply(this, arguments);
};

/**
 * @param {Number}
 *            time time of the row
 */
CalendarRow.prototype.initialize = function (time) {
	this.day = new Date(time);
	this.weekdayName = $.resource('weekday' + this.day.getDay());

	this.past = ko.computed(function () {
		return time < DateUtil.today();
	});
	this.thisweek = ko.computed(function () {
		var thisWeek = DateUtil.thisWeek();
		return thisWeek <= time && time < (thisWeek + DateUtil.WEEK_UNIT);
	});

	this.tasklists = ko.observableArray();
};

/**
 * Return day for new task adding to this row.
 * 
 * @returns {Date}
 */
CalendarRow.prototype.getDayForNewTask = function () {
	return this.day;
};

/**
 * Update the task dropped to this row.
 * 
 * @param {Task}
 *            task dropped task
 */
CalendarRow.prototype.dropped = function (task) {
	TaskService.update(task, {
		due: this.day
	});
};

/**
 * @class daily calendar
 * @param {Taskdata}
 *            taskdata
 */
function DailyCalendarViewModel (taskdata) {
	this.initialize.apply(this, arguments);
};

/**
 * Number of days to show in the calendar.
 */
DailyCalendarViewModel.NUMBER_OF_DAYS = 14;

/**
 * @param {Taskdata}
 *            taskdata
 */
DailyCalendarViewModel.prototype.initialize = function (taskdata) {
	// set up days in the calendar
	this.rows = ko.computed(function () {
		return DateUtil.arrayOfDays(
				DateUtil.thisWeek(),
				DailyCalendarViewModel.NUMBER_OF_DAYS,
				function (time) {
					return new CalendarRow(time);
				});
	}, this);

	// put tasks into each day
	ko.computed(function () {
		var dueIndex = taskdata.dueIndex();
		this.rows().forEach(function (row) {
			var tasksInDay = dueIndex.getTasks(row.day.getTime());
			row.tasklists(Tasks.groupByTasklist(tasksInDay));
		});
	}, this);
};

/**
 * @class weekly calendar
 * @param {Taskdata}
 *            taskdata
 */
function WeeklyCalendarViewModel (taskdata) {
	this.initialize.apply(this, arguments);
};

/**
 * Number of weeks to be shown in the calendar.
 */
WeeklyCalendarViewModel.NUMBER_OF_WEEKS = 8;

/**
 * @param {Taskdata}
 *            taskdata
 */
WeeklyCalendarViewModel.prototype.initialize = function (taskdata) {
	// set up weeks in the calendar
	this.rows = ko.computed(function () {
		return DateUtil.arrayOfWeeks(
				DateUtil.thisWeek(),
				WeeklyCalendarViewModel.NUMBER_OF_WEEKS,
				function (time) {
					return new CalendarRow(time);
				});
	}, this);

	// put tasks into each week
	ko.computed(function () {
		var dueIndex = taskdata.dueIndex();
		this.rows().forEach(function (row) {
			var tasksInWeek = Array.prototype.concat.apply([],
				DateUtil.arrayOfDays(row.day.getTime(), 7, function (time) {
					return dueIndex.getTasks(time);
				}));
			row.tasklists(Tasks.groupByTasklist(tasksInWeek));
		});
	}, this);
};

/**
 * @class monthly calendar
 * @param {Taskdata}
 *            taskdata
 */
function MonthlyCalendarViewModel (taskdata) {
	this.initialize.apply(this, arguments);
};

/**
 * Number of weeks to be shown in the calendar.
 */
MonthlyCalendarViewModel.NUMBER_OF_MONTHS = 12;

/**
 * @param {Taskdata}
 *            taskdata
 */
MonthlyCalendarViewModel.prototype.initialize = function (taskdata) {
	// set up months in the calendar
	this.rows = ko.computed(function () {
		return DateUtil.arrayOfMonths(
				DateUtil.thisMonth(),
				MonthlyCalendarViewModel.NUMBER_OF_MONTHS,
				function (thisMonth, nextMonth) {
					var row = new CalendarRow(thisMonth);
					row.nextMonth = nextMonth;
					return row;
				});
	}, this);

	// put tasks into each month
	ko.computed(function () {
		var tasks = taskdata.tasks();
		this.rows().forEach(function (row) {
			row.tasklists(Tasks.groupByTasklist(tasks
					.filter(TaskFilters.dueRange(row.day.getTime(), row.nextMonth - 1))));
		});
	}, this);
};

/**
 * @class Icebox tasks view model.
 * @param {Taskdata}
 *            taskdata
 */
function IceboxTasksViewModel (taskdata) {
	this.initialize.apply(this, arguments);
};

/**
 * @param {Taskdata}
 *            taskdata
 */
IceboxTasksViewModel.prototype.initialize = function (taskdata) {
	this.tasklists = ko.computed(function () {
		return Tasks.groupByTasklist(taskdata.dueIndex().getTasksInIceBox());
	});
};

/**
 * Return day for new task adding to this row.
 * 
 * @returns {Date}
 */
IceboxTasksViewModel.prototype.getDayForNewTask = function () {
	// indicates the ice box
	return null;
};

/**
 * Update the task dropped to this row.
 * 
 * @param {Task}
 *            task dropped task
 */
IceboxTasksViewModel.prototype.dropped = function (task) {
	TaskService.update(task, {
		due: null
	});
};

/**
 * @class past tasks view model (contains tasks in last week and ago)
 * @param {Taskdata}
 *            taskdata
 */
function PastTasksViewModel (taskdata) {
	this.initialize.apply(this, arguments);
};

/**
 * @param {Taskdata}
 *            taskdata
 */
PastTasksViewModel.prototype.initialize = function (taskdata) {
	this.tasklists = ko.computed(function () {
		return Tasks.groupByTasklist(taskdata.tasks().filter(TaskFilters.dueBefore(DateUtil.thisWeek())));
	});
};

/**
 * Dropped.
 * 
 * @param {Task}
 *            task
 * @param {Event}
 *            e
 * @param {Object}
 *            viewModel target view model
 */
Task.prototype.dropped = function (task, e, viewModel) {
	// execute asynchronously to prevent exception:
	// TypeError: Cannot read property 'options' of undefined
	window.setTimeout(function () {
		if ($.isFunction(viewModel.dropped)) {
			viewModel.dropped(task);
		}
	});
};
