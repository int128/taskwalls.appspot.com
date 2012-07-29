/**
 * @class daily calendar
 * @param {Taskdata} taskdata
 */
function DailyCalendarViewModel (taskdata) {
	this.initialize.apply(this, arguments);
};
/**
 * @param {Taskdata} taskdata
 */
DailyCalendarViewModel.prototype.initialize = function (taskdata) {
	this.firstDay = ko.computed(function () {
		return taskwalls.settings.today().getFirstDayOfWeek().getTime();
	}, this);
	this.lastDay = ko.computed(function () {
		return this.firstDay() + 14 * 86400000;
	}, this);
	this.days = ko.computed(function () {
		// make array of days in this week
		var lastDay = this.lastDay(),
			days = [], i = 0;
		for (var t = this.firstDay(); t <= lastDay; t += 86400000) {
			days[i++] = new CalendarDayViewModel(t);
		}
		return days;
	}, this);

	this.past = new PastTasksViewModel();
	this.future = new FutureTasksViewModel();

	ko.computed(function () {
		TaskViewModel.extend(taskdata.tasks());
		var tasksByDue = taskdata.tasksByDue();

		$.each(this.days(), function (i, day) {
			day.tasklists($.map(Tasks.groupByTasklist(tasksByDue.get(day.date)),
				function (tasksInTasklist) {
					return {
						tasklist: tasksInTasklist[0].tasklist(),
						tasks: tasksInTasklist
					};
				}));
		});

		this.past.tasklists($.map(Tasks.groupByTasklist(tasksByDue.getBefore(this.firstDay())),
			function (tasksInTasklist) {
				return {
					tasklist: tasksInTasklist[0].tasklist(),
					tasks: tasksInTasklist
				};
			}));

		this.future.tasklists($.map(Tasks.groupByTasklist(tasksByDue.getAfter(this.lastDay())),
				function (tasksInTasklist) {
					return {
						tasklist: tasksInTasklist[0].tasklist(),
						tasks: tasksInTasklist
					};
				}));
	}, this);

	/**
	 * Clear completed tasks.
	 */
	this.clearCompleted = function () {
		taskdata.clearCompletedTasks();
	};
};
/**
 * @class Daily row of the calendar.
 * @param {Number} time day of the row
 */
function CalendarDayViewModel (time) {
	this.initialize.apply(this, arguments);
};
/**
 * @param {Number} time day of the row
 */
CalendarDayViewModel.prototype.initialize = function (time) {
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
		var tasks = taskdata.tasksByDue().getInIceBox();
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
 * @class Past tasks view model.
 */
function PastTasksViewModel () {
	this.initialize.apply(this, arguments);
};
PastTasksViewModel.prototype.initialize = function () {
	this.tasklists = ko.observableArray();
};
/**
 * @class Future tasks view model.
 */
function FutureTasksViewModel () {
	this.initialize.apply(this, arguments);
};
FutureTasksViewModel.prototype.initialize = function () {
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
	this.rows = ko.computed(function () {
		var firstDay = taskwalls.settings.today().getFirstDayOfWeek().getTime();
		var lastDay = firstDay + WeeklyCalendarViewModel.NUMBER_OF_WEEKS * 7 * 86400000;
		var rows = [], i = 0;
		for (var time = firstDay; time <= lastDay; time += 7 * 86400000) {
			rows[i++] = new WeeklyCalendarViewModel.Row(time);
		}
		return rows;
	}, this);

	ko.computed(function () {
		var tasks = TaskViewModel.extend(taskdata.tasks());
		$.each(this.rows(), function (i, row) {
			var tasksOnRow = Tasks.range(tasks, row.beginTime, row.endTime);
			row.tasklists($.map(Tasks.groupByTasklist(tasksOnRow),
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
 * @param {Number} time begin of the week
 */
WeeklyCalendarViewModel.Row = function (time) {
	this.initialize.apply(this, arguments);
};
/**
 * @param {Number} time
 */
WeeklyCalendarViewModel.Row.prototype.initialize = function (time) {
	this.beginTime = time;
	this.endTime = time + 86400000 * 7;
	this.beginDate = new Date(this.beginTime);
	this.endDate = new Date(this.endTime);

	this.tasklists = ko.observableArray();
	this.thisweek = ko.computed(function () {
		return DateUtil.isThisWeek(this.beginTime);
	}, this);
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
