/**
 * @class calendar
 * @param {Taskdata} taskdata
 */
function CalendarViewModel (taskdata) {
	this.initialize.apply(this, arguments);
};
/**
 * @param {Taskdata} taskdata
 */
CalendarViewModel.prototype.initialize = function (taskdata) {
	var calendar = new Calendar(function (day) {
		return new CalendarDayViewModel(day);
	});

	(function () {
		var d = new Date();
		d.setHours(0, 0, 0, 0);
		d.setDate(1);
		var firstInMonth = d.getTime();
		d.setMonth(d.getMonth() + 1);
		d.setDate(0);
		var lastInMonth = d.getTime();
		calendar.extendTo(firstInMonth, lastInMonth);
	})();

	this.days = calendar.days;
	this.icebox = new CalendarIceboxViewModel();
	this.tasklists = ko.computed(function () {
		return TasklistViewModel.extend(taskdata.tasklists());
	}, this);

	this.dueMap = ko.computed(function () {
		return Tasks.groupByDue(taskdata.tasks());
	}, this);

	// extend rows to cover all tasks
	ko.computed(function () {
		var tasks = taskdata.tasks();
		if (tasks.length > 0) {
			var days = Tasks.days(tasks);
			calendar.extendTo(Math.min.apply(null, days), Math.max.apply(null, days));
		}
	});

	// arrange tasks by each due date and tasklist
	ko.computed(function () {
		$.each(this.days(), $.proxy(function (i, day) {
			var tasksInDay = this.dueMap().get(day.date());
			day.tasklists($.map(Tasks.groupByTasklist(tasksInDay), function (tasks) {
				return {
					tasklist: tasks[0].tasklist(),
					tasks: TaskViewModel.extend(tasks)
				};
			}));
		}, this));
	}, this);
	ko.computed(function () {
		var tbdTasks = TaskViewModel.extend(this.dueMap().getToBeDetermined());
		this.icebox.tasklists($.map(Tasks.groupByTasklist(tbdTasks), function (tasks) {
			return {
				tasklist: tasks[0].tasklist(),
				tasks: TaskViewModel.extend(tasks)
			};
		}));
	}, this);

	/**
	 * Last day of next month.
	 */
	this.nextMonth = ko.computed(function () {
		var d = new Date(calendar.last().time());
		d.setDate(0);  // yesterday
		d.setMonth(d.getMonth() + 2);
		return d;
	});

	this.extendToNextMonth = function () {
		calendar.extendTo(this.nextMonth());
	};
};
/**
 * @class Daily row of the calendar.
 * @param {Number} day day of the row
 */
function CalendarDayViewModel (day) {
	this.initialize.apply(this, arguments);
};
/**
 * @param {Number} day day of the row
 */
CalendarDayViewModel.prototype.initialize = function (day) {
	this.time = ko.observable(day);
	this.date = ko.computed(function () {
		return new Date(this.time());
	}, this);
	this.weekdayName = ko.computed(function () {
		return $.resource('weekday' + this.date().getDay());
	}, this);
	this.past = ko.computed(function () {
		return this.time() < taskwalls.settings.today().getTime();
	}, this);
	this.thisweek = ko.computed(function () {
		return DateUtil.isThisWeek(this.time());
	}, this);
	this.tasklists = ko.observableArray();
};
/**
 * @class Icebox view model.
 */
function CalendarIceboxViewModel () {
	this.initialize.apply(this, arguments);
};
/**
 */
CalendarIceboxViewModel.prototype.initialize = function () {
	this.tasklists = ko.observableArray();
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
		var extension = {};
		extension.saveStatus = TaskViewModel.saveStatus;
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
 * Save and update status of the task.
 */
TaskViewModel.saveStatus = function () {
	this.update({
		status: this.status()
	});
	return true;  // bubbling event for checkbox
};
