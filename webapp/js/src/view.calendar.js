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
	this.beginOfThisWeek = ko.computed(function () {
		return new Date(DateUtil.thisWeek());
	});
	this.endOfThisWeek = ko.computed(function () {
		return new Date(DateUtil.thisWeek() + DateUtil.WEEK_UNIT - 1);
	});

	var tasksInThisWeek = ko.computed(function () {
		var dueIndex = taskdata.dueIndex();
		return Array.prototype.concat.apply([],
				DateUtil.arrayOfDays(DateUtil.thisWeek(), 7, function (time) {
					return dueIndex.getTasks(time);
				}));
	});

	this.completedTasks = ko.computed(function () {
		return tasksInThisWeek().filter(TaskFilters.status('completed'));
	});
	this.workingTasks = ko.computed(function () {
		return tasksInThisWeek().filter(TaskFilters.status('needsAction'));
	});
	this.completedTasksGroups = ko.computed(function () {
		return Tasks.groupByTasklist(this.completedTasks());
	}, this);
	this.workingTasksGroups = ko.computed(function () {
		return Tasks.groupByTasklist(this.workingTasks());
	}, this);
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
	task.update({
		due: this.day
	}); // TODO: failed?
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
		$.each(this.rows(), function (i, row) {
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
		$.each(this.rows(), function (i, row) {
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
		$.each(this.rows(), function (i, row) {
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
	task.update({
		due: null
	}); // TODO: failed?
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
 * inject initializer to class {@link Tasklist}
 */
Tasklist.prototype.initialize = FunctionUtil.seq(Tasklist.prototype.initialize, function () {
	this.visible = ko.observable(true);
});

/**
 * Toggle visibility of the tasklist and its tasks.
 */
Tasklist.prototype.toggleVisibility = function () {
	this.visible(!this.visible());
};

/**
 * inject initializer to class {@link Task}
 */
Task.prototype.initialize = FunctionUtil.seq(Task.prototype.initialize, function () {
	this.past = ko.computed(function () {
		return this.due() < DateUtil.today();
	}, this);
});

/**
 * Save and update status of the task.
 */
Task.prototype.saveStatus = function () {
	this.update({
		status: this.status()
	});
	return true; // bubbling event for checkbox
};

/**
 * Dropped.
 * 
 * @param {Task}
 *            task
 * @param {Event}
 *            e
 * @param {Row}
 *            row
 */
Task.prototype.dropped = function (task, e, row) {
	// execute asynchronously to prevent exception:
	// TypeError: Cannot read property 'options' of undefined
	window.setTimeout(function () {
		if ($.isFunction(row.dropped)) {
			row.dropped(task);
		}
	});
};
