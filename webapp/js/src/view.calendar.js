/**
 * @class Calendar.
 * @param {TaskdataViewModel} taskdata
 */
function CalendarViewModel (taskdata) {
	this.taskdata = taskdata;

	// initialize rows
	var today = AppSettings.today();
	this.days = ko.observableArray([new CalendarDayViewModel(today, taskdata)]);
	this.earliestTime = ko.observable(today.getTime());
	this.latestTime = ko.observable(today.getTime());
	this.extendMonth(today);

	this.nextMonth = ko.computed(function () {
		var d = new Date(this.latestTime());
		d.setHours(24, 0, 0, 0);
		d.setDate(1);
		return d;
	}, this);

	// extend rows to cover tasks
	this.taskdata.tasks.subscribe(function (newvalue) {
		var dues = $.map(newvalue, function (task) {
			return task.due();
		});
		this.extendTo(Math.min.apply(null, dues));
		this.extendTo(Math.max.apply(null, dues));
	}, this);
};
/**
 * Extend rows of the calendar.
 * @param {Date} time time to extend (also accepts {Number})
 */
CalendarViewModel.prototype.extendTo = function (time) {
	var normalizedTime = DateUtil.normalize(time).getTime();
	if (normalizedTime > this.latestTime()) {
		// append rows
		var a = [];
		var i = 0;
		for (var t = this.latestTime() + 86400000; t <= normalizedTime; t += 86400000) {
			a[i++] = new CalendarDayViewModel(new Date(t), this.taskdata);
		}
		this.days(this.days().concat(a));
		this.latestTime(normalizedTime);
	}
	if (normalizedTime < this.earliestTime()) {
		// prepend rows
		var a = [];
		var i = 0;
		var e = this.earliestTime();
		for (var t = normalizedTime; t < e; t += 86400000) {
			a[i++] = new CalendarDayViewModel(new Date(t), this.taskdata);
		}
		this.days(a.concat(this.days()));
		this.earliestTime(normalizedTime);
	}
};
/**
 * Extend rows of the calendar.
 * @param {Date} time time to extend (also accepts {Number})
 */
CalendarViewModel.prototype.extendMonth = function (time) {
	// (from) this day
	var fromDate = new Date(time);
	fromDate.setHours(0, 0, 0, 0);
	this.extendTo(fromDate);
	// (to) last day in this month
	var toDate = new Date(time);
	toDate.setHours(0, 0, 0, 0);
	toDate.setMonth(toDate.getMonth() + 1);
	toDate.setDate(0);
	this.extendTo(toDate);
};
/**
 * Extend rows to next month.
 */
CalendarViewModel.prototype.extendToNextMonth = function () {
	this.extendMonth(this.nextMonth().getTime());
};
/**
 * @class Daily row of the calendar.
 * @param {Date} date day of the row
 * @param {TaskdataViewModel} taskdata
 */
function CalendarDayViewModel (date, taskdata) {
	var self = this;
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
	this.tasks = ko.computed(function() {
		// TODO: model?
		return $.grep(taskdata.tasks(), function (task) {
			return task.due() && task.due().getTime() == self.time();
		});
	}, this);
	/**
	 * Group by belonging tasklist.
	 * TODO: model?
	 */
	this.tasklists = ko.computed(function () {
		return $.map(taskdata.tasklists(), function (tasklist) {
			return {
				tasks: $.grep(self.tasks(), function (task) {
					return task.tasklist().id() == tasklist.id();
				})
			};
		});
	}, this);
};
/**
 * @class Planner view model.
 * @param {Taskdata} taskdata
 */
function PlannerViewModel (taskdata) {
	this.tasks = ko.computed(function() {
		// TODO: model?
		return $.grep(taskdata.tasks(), function (task) {
			return !task.due();
		});
	}, this);
};
/**
 * @class View model of {@link Taskdata}.
 */
function TaskdataViewModel (taskdata) {
	this.tasks = ko.computed(function () {
		return $.map(taskdata.tasks(), function (task) {
			return new TaskViewModel(task);
		});
	});
	this.tasklists = ko.computed(function () {
		return $.map(taskdata.tasklists(), function (tasklist) {
			return new TasklistViewModel(tasklist);
		});
	});
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
 * @class Task view model.
 * @param {Task} task
 */
function TaskViewModel (task) {
	$.extend(this, task);
	// FIXME: not work
	this.visible = ko.observable(true);
};
