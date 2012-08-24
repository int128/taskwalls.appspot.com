/**
 * @class overview of tasks
 * @param {Taskdata} taskdata
 */
function TasksOverviewViewModel (taskdata) {
	this.initialize.apply(this, arguments);
};
/**
 * @param {Taskdata} taskdata
 */
TasksOverviewViewModel.prototype.initialize = function (taskdata) {
	this.today = ko.computed(function () {
		var todayTasks = taskdata.dueIndex().getTasks(DateUtil.today());
		return Tasks.groupByTasklist(todayTasks);
	}, this);

	this.thisweek = ko.computed(function () {
		var d = DateUtil.calculateFirstDayOfWeek(DateUtil.today());
		var beginOfWeek = d.getTime();
		d.setDate(d.getDate() + 7);
		var endOfWeek = d.getTime();
		var weeklyTasks = Tasks.range(taskdata.tasks(), beginOfWeek, endOfWeek);
		return Tasks.groupByTasklist(weeklyTasks);
	}, this);
};
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
		var day = DateUtil.calculateFirstDayOfWeek(DateUtil.today());
			rows = [];
		for (var i = 0; i < DailyCalendarViewModel.NUMBER_OF_DAYS; i++) {
			rows[i] = new DailyCalendarViewModel.Row(new Date(day));
			day.setDate(day.getDate() + 1);
		}
		return rows;
	}, this);

	// put tasks into each day
	ko.computed(function () {
		var dueIndex = taskdata.dueIndex();
		$.each(this.rows(), function (i, row) {
			row.tasklists(Tasks.groupByTasklist(dueIndex.getTasks(row.day)));
		});
	}, this);
};
/**
 * @class row item of daily calendar
 * @param {Date} day day of the row
 */
DailyCalendarViewModel.Row = function (day) {
	this.initialize.apply(this, arguments);
};
/**
 * @param {Date} day day of the row
 */
DailyCalendarViewModel.Row.prototype.initialize = function (day) {
	this.day = day;
	this.weekdayName = $.resource('weekday' + day.getDay());

	this.past = ko.computed(function () {
		return day.getTime() < DateUtil.today().getTime();
	}, this);
	this.thisweek = ko.computed(function () {
		return DateUtil.areSameWeek(day, DateUtil.today());
	}, this);
	this.tasklists = ko.observableArray();
};
/**
 * Return day for new task adding to this row.
 * @returns {Date}
 */
DailyCalendarViewModel.Row.prototype.getDayForNewTask = function () {
	return this.day;
};
/**
 * Update the task dropped to this row.
 * @param {Task} task dropped task
 */
DailyCalendarViewModel.Row.prototype.dropped = function (task) {
	task.update({
		due: this.day
	});  // TODO: failed?
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
		var day = DateUtil.calculateFirstDayOfWeek(DateUtil.today()),
			rows = [];
		for (var i = 0; i < WeeklyCalendarViewModel.NUMBER_OF_WEEKS; i++) {
			var beginOfThisWeek = new Date(day);
			day.setDate(day.getDate() + 7);
			var endOfThisWeek = new Date(day);
			rows[i] = new WeeklyCalendarViewModel.Row(beginOfThisWeek, endOfThisWeek);
		}
		return rows;
	}, this);

	// put tasks into each week
	ko.computed(function () {
		var tasks = taskdata.tasks();
		$.each(this.rows(), function (i, row) {
			var tasksInWeek = Tasks.range(tasks,
					row.beginOfThisWeek.getTime(),
					row.endOfThisWeek.getTime());
			row.tasklists(Tasks.groupByTasklist(tasksInWeek));
		});
	}, this);
};
/**
 * @constructor row item of {@link WeeklyCalendarViewModel}
 * @param {Date} beginOfThisWeek time of Monday 0:00 in this week
 * @param {Date} endOfThisWeek   time of Monday 0:00 in next week
 */
WeeklyCalendarViewModel.Row = function (beginOfThisWeek, endOfThisWeek) {
	this.initialize.apply(this, arguments);
};
/**
 * @param {Date} beginOfThisWeek
 * @param {Date} endOfThisWeek
 */
WeeklyCalendarViewModel.Row.prototype.initialize = function (beginOfThisWeek, endOfThisWeek) {
	this.beginOfThisWeek = beginOfThisWeek;
	this.endOfThisWeek = endOfThisWeek;

	this.tasklists = ko.observableArray();
	this.thisweek = ko.computed(function () {
		return DateUtil.areSameWeek(beginOfThisWeek, DateUtil.today());
	}, this);
};
/**
 * Return day for new task adding to this row.
 * @returns {Date}
 */
WeeklyCalendarViewModel.Row.prototype.getDayForNewTask = function () {
	return this.beginOfThisWeek;
};
/**
 * Update the task dropped to this row.
 * @param {Task} task dropped task
 */
WeeklyCalendarViewModel.Row.prototype.dropped = function (task) {
	task.update({
		due: this.beginOfThisWeek
	});  // TODO: failed?
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
		var date = DateUtil.calculateFirstDayOfMonth(DateUtil.today()),
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
		$.each(this.rows(), function (i, row) {
			var tastsInMonth = Tasks.range(tasks,
					row.beginOfThisMonth.getTime(),
					row.endOfThisMonth.getTime());
			row.tasklists(Tasks.groupByTasklist(tastsInMonth));
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
		return DateUtil.areSameWeek(beginOfThisMonth, DateUtil.today());
	}, this);
};
/**
 * Return day for new task adding to this row.
 * @returns {Date}
 */
MonthlyCalendarViewModel.Row.prototype.getDayForNewTask = function () {
	return this.beginOfThisMonth;
};
/**
 * Update the task dropped to this row.
 * @param {Task} task dropped task
 */
MonthlyCalendarViewModel.Row.prototype.dropped = function (task) {
	task.update({
		due: this.beginOfThisMonth
	});  // TODO: failed?
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
		return Tasks.groupByTasklist(taskdata.dueIndex().getTasksInIceBox());
	});
};
/**
 * Return day for new task adding to this row.
 * @returns {Date}
 */
IceboxTasksViewModel.prototype.getDayForNewTask = function () {
	// indicates the ice box
	return null;
};
/**
 * Update the task dropped to this row.
 * @param {Task} task dropped task
 */
IceboxTasksViewModel.prototype.dropped = function (task) {
	task.update({
		due: null
	});  // TODO: failed?
};
/**
 * @class past tasks view model (contains tasks in last week and ago)
 * @param {Taskdata} taskdata
 */
function PastTasksViewModel (taskdata) {
	this.initialize.apply(this, arguments);
};
/**
 * @param {Taskdata} taskdata
 */
PastTasksViewModel.prototype.initialize = function (taskdata) {
	this.tasklists = ko.computed(function () {
		var firstDayOfThisWeek = DateUtil.calculateFirstDayOfWeek(DateUtil.today()).getTime();
		return Tasks.groupByTasklist(Tasks.before(taskdata.tasks(), firstDayOfThisWeek));
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
 * Save and update status of the task.
 */
Task.prototype.saveStatus = function () {
	this.update({
		status: this.status()
	});
	return true;  // bubbling event for checkbox
};
/**
 * Dropped.
 * @param {Task} task
 * @param {Event} e
 * @param {Row} row
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
