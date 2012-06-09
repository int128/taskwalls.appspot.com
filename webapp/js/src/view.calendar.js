/**
 * @class Calendar.
 * @param {Taskdata} taskdata
 */
function CalendarViewModel (taskdata) {
	var calendar = new Calendar();

	// (from) this day
	var fromDate = new Date();
	fromDate.setHours(0, 0, 0, 0);
	fromDate.setDate(1);
	calendar.extendTo(fromDate);
	// (to) last day in this month
	var toDate = new Date();
	toDate.setHours(0, 0, 0, 0);
	toDate.setMonth(toDate.getMonth() + 1);
	toDate.setDate(0);
	calendar.extendTo(toDate);

	this.days = ko.computed(function () {
		return $.map(calendar.days(), function (day) {
			return new CalendarDayViewModel(day);
		});
	});
	/**
	 * Last day of next month.
	 */
	this.nextMonth = ko.computed(function () {
		var d = new Date(calendar.latestTime());
		d.setDate(0);
		d.setMonth(d.getMonth() + 2);
		return d;
	});
	this.extendToNextMonth = function () {
		calendar.extendTo(this.nextMonth());
	};

	ko.computed(function () {
		$.each(this.days(), function (i, day) {
			var tasksInDay = taskdata.dueMap().get(day.date());
			day.tasklists($.map(Tasks.groupByTasklist(tasksInDay), function (tasks) {
				return {
					tasks: TaskViewModel.map(tasks)
				};
			}));
		});
	}, this);

	// FIXME: need to extend rows
//	ko.computed(function () {
//		// extend rows to cover tasks
//		var dues = $.map(taskdata.tasks(), function (task) {
//			return task.due();
//		});
//		calendar.extendTo(Math.min.apply(null, dues));
//		calendar.extendTo(Math.max.apply(null, dues));
//	});
};
/**
 * @class Daily row of the calendar.
 * @param {Date} date day of the row
 */
function CalendarDayViewModel (date) {
	this.date = ko.observable(date);
	this.time = ko.computed(function () {
		return this.date().getTime();
	}, this);
	this.month = ko.computed(function () {
		return this.date().getMonth() + 1;
	}, this);
	this.day = ko.computed(function () {
		return this.date().getDate();
	}, this);
	this.weekday = ko.computed(function () {
		return this.date().getDay();
	}, this);
	this.weekdayName = ko.computed(function () {
		return $.resource('weekday' + this.weekday());
	}, this);
	this.past = ko.computed(function () {
		return this.time() < AppSettings.today().getTime();
	}, this);
	this.thisweek = ko.computed(function () {
		return DateUtil.isThisWeek(this.time());
	}, this);
	this.tasklists = ko.observableArray();
};
/**
 * @class Planner view model.
 * @param {Taskdata} taskdata
 */
function PlannerViewModel (taskdata) {
	this.tasks = ko.computed(function() {
		return TaskViewModel.map(taskdata.dueMap().getToBeDetermined());
	}, this);
};
/**
 * @class Tasklist view model.
 * @param {Tasklist} tasklist
 */
function TasklistViewModel (tasklist) {
	$.extend(this, tasklist);
	this.visible = ko.observable(true);
	this.toggleVisibility = function () {
		this.visible(!this.visible());
	};
};
/**
 * Map {@link Tasklist} to {@link TasklistViewModel}.
 * @param {Array} tasklists
 */
TasklistViewModel.map = function (tasklists) {
	return $.map(tasklists, function (tasklist) {
		return new TasklistViewModel(tasklist);
	});
};
/**
 * @class Task view model.
 * @param {Task} task
 */
function TaskViewModel (task) {
	$.extend(this, task);
	// FIXME: not work
	this.visible = ko.observable(true);
};
/**
 * Map {@link Task} to {@link TaskViewModel}.
 * @param {Array} tasks
 */
TaskViewModel.map = function (tasks) {
	return $.map(tasks, function (task) {
		return new TaskViewModel(task);
	});
};
