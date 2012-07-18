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
	this.days = ko.computed(function () {
		// make array of days in this week
		var d = new Date(taskwalls.settings.today());
		d.setDate(d.getDate() - (d.getDay()+6)%7);
		var first = d.getTime();
		d.setDate(d.getDate() + 14);
		var last = d.getTime();
		var days = [], i = 0;
		for (var t = first; t <= last; t += 86400000) {
			days[i++] = new CalendarDayViewModel(t);
		}
		return days;
	}, this);
	this.icebox = new CalendarIceboxViewModel();

	ko.computed(function () {
		TaskViewModel.extend(taskdata.tasks());
		var tasksByDue = Tasks.groupByDue(taskdata.tasks());

		$.each(this.days(), function (i, day) {
			day.tasklists($.map(Tasks.groupByTasklist(tasksByDue.get(day.date())),
				function (tasksInTasklist) {
					return {
						tasklist: tasksInTasklist[0].tasklist(),
						tasks: tasksInTasklist
					};
				}));
		});

		this.icebox.tasklists($.map(Tasks.groupByTasklist(tasksByDue.getInIceBox()),
			function (tasksInTasklist) {
				return {
					tasklist: tasksInTasklist[0].tasklist(),
					tasks: tasksInTasklist
				};
			}));
	}, this);

	this.tasklists = ko.computed(function () {
		return TasklistViewModel.extend(taskdata.tasklists());
	}, this);

	/**
	 * Last day of next month.
	 */
	this.nextMonth = ko.computed(function () {
		// TODO:
/*
		var d = new Date(calendar.last().time());
		d.setDate(1);
		d.setMonth(d.getMonth() + 2);
		d.setDate(0);
		return d;
*/
	});

	this.extendToNextMonth = function () {
		// TODO:
		//calendar.extendTo(this.nextMonth());
	};

	this.shrinkOrigin = function (time) {
		// TODO:
	};

	/**
	 * Clear completed tasks.
	 */
	this.clearCompleted = function () {
		taskdata.clearCompletedTasks();
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
		} else if (day instanceof CalendarIceboxViewModel) {
			task.update({
				due: null
			});  // TODO: failed?
		}
	});
};
