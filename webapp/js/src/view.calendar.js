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
	this.tasklists = ko.computed(function () {
		return TasklistViewModel.map(taskdata.tasklists());
	});

	// extend rows to cover all tasks
	ko.computed(function () {
		var tasks = taskdata.tasks();
		if (tasks.length > 0) {
			var days = Tasks.days(tasks);
			calendar.extendTo(Math.min.apply(null, days), Math.max.apply(null, days));
		}
	});

	// arrange tasks by each due date and tasklist
	var tasklistsIdMap = ko.computed(function () {
		var map = {};
		$.each(this.tasklists(), function (i, tasklist) {
			map[tasklist.id()] = tasklist;
		});
		return map;
	}, this);

	ko.computed(function () {
		$.each(this.days(), function (i, day) {
			var tasksInDay = taskdata.dueMap().get(day.date());
			day.tasklists($.map(Tasks.groupByTasklist(tasksInDay), function (tasks, tasklistId) {
				var tasklistvm = tasklistsIdMap()[tasklistId];
				return {
					visible: tasklistvm ? tasklistvm.visible() : true,  // always true while initializing
					tasks: TaskViewModel.map(tasks)
				};
			}));
		});
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
 * @class Planner view model.
 * @param {Taskdata} taskdata
 */
function PlannerViewModel (taskdata) {
	this.initialize.apply(this, arguments);
};
/**
 * @param {Taskdata} taskdata
 */
PlannerViewModel.prototype.initialize = function (taskdata) {
	this.tasks = ko.computed(function() {
		return TaskViewModel.map(taskdata.dueMap().getToBeDetermined());
	}, this);
};
/**
 * @class Tasklist view model.
 * @param {Tasklist} tasklist
 */
function TasklistViewModel (tasklist) {
	this.initialize.apply(this, arguments);
};
/**
 * @param {Tasklist} tasklist
 */
TasklistViewModel.prototype.initialize = function (tasklist) {
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
	this.initialize.apply(this, arguments);
	var self = this;
	this.saveStatus = function () {
		self.update({
			status: self.status()
		});
		return true;  // bubbling event for checkbox
	};
};
/**
 * @param {Task} task
 */
TaskViewModel.prototype.initialize = function (task) {
	$.extend(this, task);
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
