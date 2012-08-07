/**
 * @class daily calendar
 * @param {Taskdata} taskdata
 */
function DailyCalendarViewModel (taskdata) {
	this.initialize.apply(this, arguments);
};
/**
 * Number of days to show in the calendar.
 */
DailyCalendarViewModel.NUMBER_OF_DAYS = 14;
/**
 * @param {Taskdata} taskdata
 */
DailyCalendarViewModel.prototype.initialize = function (taskdata) {
	// set up days in the calendar
	this.rows = ko.computed(function () {
		var today = taskwalls.settings.today(),
			firstDay = today.getFirstDayOfWeek().getTime(),
			lastDay = firstDay + (DailyCalendarViewModel.NUMBER_OF_DAYS - 1) * 86400000,
			rows = [],
			i = 0;
		for (var time = firstDay; time <= lastDay; time += 86400000) {
			rows[i++] = new DailyCalendarViewModel.Row(time);
		}
		return rows;
	}, this);

	this.pastTasks = ko.observableArray();
	this.futureTasks = ko.observableArray();

	// put tasks into each day
	ko.computed(function () {
		var tasks = taskdata.tasks();
		TaskViewModel.extend(tasks);

		var dueIndex = taskdata.dueIndex();
		var rows = this.rows();

		$.each(rows, function (i, row) {
			row.tasklists($.map(Tasks.groupByTasklist(dueIndex.getTasks(row.date)),
				function (tasksInTasklist) {
					return {
						tasklist: tasksInTasklist[0].tasklist(),
						tasks: tasksInTasklist
					};
				}));
		});

		var firstDay = rows[0];
		this.pastTasks($.map(Tasks.groupByTasklist(Tasks.before(tasks, firstDay.time)),
			function (tasksInTasklist) {
				return {
					tasklist: tasksInTasklist[0].tasklist(),
					tasks: tasksInTasklist
				};
			}));

		var lastDay = rows[rows.length - 1];
		this.futureTasks($.map(Tasks.groupByTasklist(Tasks.after(tasks, lastDay.time)),
			function (tasksInTasklist) {
				return {
					tasklist: tasksInTasklist[0].tasklist(),
					tasks: tasksInTasklist
				};
			}));
	}, this);

	/**
	 * Clear completed tasks.
	 * TODO: should clear completed tasks in past
	 */
	this.clearCompleted = function () {
		taskdata.clearCompletedTasks();
	};
};
/**
 * @class row item of daily calendar
 * @param {Number} time day of the row
 */
DailyCalendarViewModel.Row = function (time) {
	this.initialize.apply(this, arguments);
};
/**
 * @param {Number} time day of the row
 */
DailyCalendarViewModel.Row.prototype.initialize = function (time) {
	this.time = time;
	this.date = new Date(time);
	this.weekdayName = $.resource('weekday' + this.date.getDay());

	this.past = ko.computed(function () {
		return this.time < taskwalls.settings.today().getTime();
	}, this);
	this.thisweek = ko.computed(function () {
		return DateUtil.isThisWeek(this.time);
	}, this);
	this.tasklists = ko.observableArray();
};
/**
 * @class weekly calendar
 * @param {Taskdata} taskdata
 */
function WeeklyCalendarViewModel (taskdata) {
	this.initialize.apply(this, arguments);
};
/**
 * Number of weeks to be shown in the calendar.
 */
WeeklyCalendarViewModel.NUMBER_OF_WEEKS = 8;
/**
 * @param {Taskdata} taskdata
 */
WeeklyCalendarViewModel.prototype.initialize = function (taskdata) {
	// set up weeks in the calendar
	this.rows = ko.computed(function () {
		var day = taskwalls.settings.today().getFirstDayOfWeek(),
			rows = [];
		for (var i = 0; i < WeeklyCalendarViewModel.NUMBER_OF_WEEKS; i++) {
			rows[i] = new WeeklyCalendarViewModel.Row(day.getTime());
			day.setDate(day.getDate() + 7);
		}
		return rows;
	}, this);

	// put tasks into each week
	ko.computed(function () {
		var tasks = taskdata.tasks();
		TaskViewModel.extend(tasks);
		$.each(this.rows(), function (i, row) {
			var beginOfThisWeek = row.monday.getTime();
			var endOfThisWeek = beginOfThisWeek + 7 * 86400000;
			row.tasklists($.map(
					Tasks.groupByTasklist(Tasks.range(tasks, beginOfThisWeek, endOfThisWeek)),
					function (tasksInTasklist) {
						return {
							tasklist: tasksInTasklist[0].tasklist(),
							tasks: tasksInTasklist
						};
					}));
		});
	}, this);
};
/**
 * @constructor row item of {@link WeeklyCalendarViewModel}
 * @param {Number} mondayTime time of Monday 0:00 in this week
 */
WeeklyCalendarViewModel.Row = function (mondayTime) {
	this.initialize.apply(this, arguments);
};
/**
 * @param {Number} mondayTime
 */
WeeklyCalendarViewModel.Row.prototype.initialize = function (mondayTime) {
	this.monday = new Date(mondayTime);

	this.tasklists = ko.observableArray();
	this.thisweek = ko.computed(function () {
		return DateUtil.isThisWeek(mondayTime);
	}, this);
};
/**
 * @class monthly calendar
 * @param {Taskdata} taskdata
 */
function MonthlyCalendarViewModel (taskdata) {
	this.initialize.apply(this, arguments);
};
/**
 * Number of weeks to be shown in the calendar.
 */
MonthlyCalendarViewModel.NUMBER_OF_MONTHS = 12;
/**
 * @param {Taskdata} taskdata
 */
MonthlyCalendarViewModel.prototype.initialize = function (taskdata) {
	// set up months in the calendar
	this.rows = ko.computed(function () {
		var date = taskwalls.settings.today().getFirstDayOfMonth(),
			rows = [];
		for (var i = 0; i < MonthlyCalendarViewModel.NUMBER_OF_MONTHS; i++) {
			var beginOfThisMonth = new Date(date);
			date.setMonth(date.getMonth() + 1);
			var endOfThisMonth = new Date(date);
			rows[i] = new MonthlyCalendarViewModel.Row(beginOfThisMonth, endOfThisMonth);
		}
		return rows;
	}, this);

	// put tasks into each month
	ko.computed(function () {
		var tasks = taskdata.tasks();
		TaskViewModel.extend(tasks);
		$.each(this.rows(), function (i, row) {
			var tastsInMonth = Tasks.range(tasks,
					row.beginOfThisMonth.getTime(),
					row.endOfThisMonth.getTime());
			row.tasklists($.map(Tasks.groupByTasklist(tastsInMonth),
					function (tasksInTasklist) {
						return {
							tasklist: tasksInTasklist[0].tasklist(),
							tasks: tasksInTasklist
						};
					}));
		});
	}, this);
};
/**
 * @constructor row item of {@link MonthlyCalendarViewModel}
 * @param {Date} beginOfThisMonth first day of this month
 * @param {Date} endOfThisMonth   first day of next month
 */
MonthlyCalendarViewModel.Row = function (beginOfThisMonth, endOfThisMonth) {
	this.initialize.apply(this, arguments);
};
/**
 * @param {Date} beginOfThisMonth first day of this month
 * @param {Date} endOfThisMonth   first day of next month
 */
MonthlyCalendarViewModel.Row.prototype.initialize = function (beginOfThisMonth, endOfThisMonth) {
	this.beginOfThisMonth = beginOfThisMonth;
	this.endOfThisMonth = endOfThisMonth;

	this.tasklists = ko.observableArray();
	this.thisweek = ko.computed(function () {
		return DateUtil.isThisWeek(beginOfThisMonth);
	}, this);
};
/**
 * @class Icebox tasks view model.
 * @param {Taskdata} taskdata
 */
function IceboxTasksViewModel (taskdata) {
	this.initialize.apply(this, arguments);
};
/**
 * @param {Taskdata} taskdata
 */
IceboxTasksViewModel.prototype.initialize = function (taskdata) {
	this.tasklists = ko.computed(function () {
		var tasks = taskdata.dueIndex().getTasksInIceBox();
		TaskViewModel.extend(tasks);
		return $.map(Tasks.groupByTasklist(tasks),
				function (tasksInTasklist) {
					return {
						tasklist: tasksInTasklist[0].tasklist(),
						tasks: tasksInTasklist
					};
				});
	});
};
/**
 * @class Tasklist view model.
 */
function TasklistViewModel () {}
/**
 * @param {Tasklist} target an instance (also accepts {@link Array})
 */
TasklistViewModel.extend = function (target) {
	var extend = function () {
		var extension = {};
		extension.visible = ko.observable(true);
		extension.toggleVisibility = TasklistViewModel.toggleVisibility;
		$.extend(this, extension);
	};

	if ($.isArray(target)) {
		$.each(target, extend);
	} else {
		extend.apply(target);
	}
	return target;
};
/**
 * Toggle visibility of the tasklist and its tasks.
 */
TasklistViewModel.toggleVisibility = function () {
	this.visible(!this.visible());
};
/**
 * @class Task view model.
 */
function TaskViewModel () {}
/**
 * @param {Task} target an instance (also accepts {@link Array})
 */
TaskViewModel.extend = function (target) {
	var extend = function () {
		// TODO: apply to other classes
		$.extend(this, TaskViewModel.prototype);
	};
	if ($.isArray(target)) {
		$.each(target, extend);
	} else {
		extend.apply(target);
	}
	return target;
};
/**
 * Save and update status of the task.
 */
TaskViewModel.prototype.saveStatus = function () {
	this.update({
		status: this.status()
	});
	return true;  // bubbling event for checkbox
};
/**
 * Dropped.
 * @param {Task} task
 * @param {Event} e
 * @param {CalendarDayViewModel} day
 */
TaskViewModel.prototype.dropped = function (task, e, day) {
	// execute asynchronously to prevent exception:
	// TypeError: Cannot read property 'options' of undefined
	window.setTimeout(function () {
		if (day instanceof CalendarDayViewModel) {
			task.update({
				due: day.date()
			});  // TODO: failed?
		} else if (day instanceof IceboxTasksViewModel) {
			task.update({
				due: null
			});  // TODO: failed?
		}
	});
};
