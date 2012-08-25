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
		var dueIndex = taskdata.dueIndex();
		var tasksInWeek = Array.prototype.concat.apply([],
				DateUtil.arrayOfDays(DateUtil.thisWeek(), 7, function (time) {
					return dueIndex.getTasks(time);
				}));
		return Tasks.groupByTasklist(tasksInWeek);
	}, this);
};
/**
 * @class abstract row of calendar
 * @param {Number} time time of the row
 */
function CalendarRow (time) {
	this.initialize.apply(this, arguments);
};
/**
* @param {Number} time time of the row
*/
CalendarRow.prototype.initialize = function (time) {
	this.day = new Date(time);
	this.weekdayName = $.resource('weekday' + this.day.getDay());

	this.past = ko.computed(function () {
		return time < DateUtil.today();
	});
	this.thisweek = ko.computed(function () {
		var thisWeek = DateUtil.thisWeek();
		return thisWeek <= time && time < (thisWeek + 7 * 24 * 60 * 60 * 1000);
	});

	this.tasklists = ko.observableArray();
};
/**
* Return day for new task adding to this row.
* @returns {Date}
*/
CalendarRow.prototype.getDayForNewTask = function () {
	return this.day;
};
/**
* Update the task dropped to this row.
* @param {Task} task dropped task
*/
CalendarRow.prototype.dropped = function (task) {
	task.update({
		due: this.day
	});  // TODO: failed?
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
			row.tasklists(Tasks.groupByTasklist(dueIndex.getTasks(row.day.getTime())));
		});
	}, this);
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
			var tastsInMonth = Tasks.range(tasks, row.day.getTime(), row.nextMonth);
			row.tasklists(Tasks.groupByTasklist(tastsInMonth));
		});
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
		return Tasks.groupByTasklist(Tasks.before(taskdata.tasks(), DateUtil.thisWeek()));
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
