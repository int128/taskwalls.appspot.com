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
	var calendar = new Calendar();
	(function (d) {
		d.setHours(0, 0, 0, 0);
		d.setDate(1);
		calendar.extendTo(d);
		d.setMonth(d.getMonth() + 1);
		d.setDate(0);
		calendar.extendTo(d);
	})(new Date());

	this.days = ko.computed(function () {
		return $.map(calendar.days(), function (day) {
			return new CalendarDayViewModel(day);
		});
	});

	// extend rows to show all tasks
	ko.computed(function () {
		var dues = taskdata.dueMap().days();
		window.setTimeout(function () {
			// lazy execution in order to prevent infinite loop
			calendar.extendTo(Math.min.apply(null, dues));
			calendar.extendTo(Math.max.apply(null, dues));
		});
	});

	this.tasklists = ko.computed(function () {
		return TasklistViewModel.map(taskdata.tasklists());
	});

	// arrange tasks by each due date and tasklist
	ko.computed(function () {
		var tasklistIdMap = {};
		$.each(this.tasklists(), function (i, tasklist) {
			tasklistIdMap[tasklist.id()] = tasklist;
		});

		$.each(this.days(), function (i, day) {
			var tasksInDay = taskdata.dueMap().get(day.date());
			day.tasklists($.map(Tasks.groupByTasklist(tasksInDay), function (tasks, tasklistId) {
				var tasklistvm = tasklistIdMap[tasklistId];
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
		var d = new Date(calendar.latestTime());
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
 * @param {Date} date day of the row
 */
function CalendarDayViewModel (date) {
	this.initialize.apply(this, arguments);
};
/**
 * @param {Date} date day of the row
 */
CalendarDayViewModel.prototype.initialize = function (date) {
	this.date = ko.observable(date);
	this.time = ko.computed(function () {
		return this.date().getTime();
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
		return true;  // enables bubbling
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
