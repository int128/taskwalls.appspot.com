/**
 * @constructor {@link CalendarViewModel}
 * @param {TaskdataViewModel} taskdata
 */
var CalendarViewModel = function (taskdata) {
	this.taskdata = taskdata;

	// initialize rows
	var today = DateUtil.normalize(new Date());
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
 * @constructor {@link CalendarDayViewModel}
 * @param {Date} date day of the row
 * @param {TaskdataViewModel} taskdata
 */
var CalendarDayViewModel = function (date, taskdata) {
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
		return $.resource('key-weekday' + this.weekday()).text();
	}, this);
	this.past = ko.computed(function () {
		return this.time() < DateUtil.normalize(new Date());
	}, this);
	this.today = ko.computed(function () {
		return this.time() == DateUtil.normalize(new Date());
	}, this);
	this.thisweek = ko.computed(function () {
		return DateUtil.isThisWeek(this.time());
	}, this);
	this.tasks = ko.computed(function() {
		return $.grep(taskdata.tasks(), function (task) {
			return task.due() && task.due().getTime() == self.time();
		});
	}, this);
	this.tasklists = ko.computed(function () {
		// group by tasklist
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
 * @constructor {@link TaskdataViewModel}
 */
var TaskdataViewModel = function () {
	this.tasks = ko.observableArray();
	this.tasklists = ko.observableArray();
};
/**
 * Load tasklists and tasks.
 */
TaskdataViewModel.prototype.load = function () {
	var self = this;
	var defaultTasklistID = null;
	var tasklistsLoaded = false;
	var loadAllTasklists = function () {
		if (defaultTasklistID && tasklistsLoaded) {
			$.each(self.tasklists(), function (i, tasklist) {
				if (tasklist.id() == defaultTasklistID) {
					// fix tasks in the default tasklist
					$.each(self.tasks(), function (i2, task) {
						if (task.tasklist().id() == '@default') {
							task.tasklist(tasklist);
						}
					});
				} else {
					// merge tasks in other tasklists
					Tasks.get(tasklist.id(), function (items) {
						self.tasks($.merge(self.tasks(), $.map(items, function (task) {
							return new TaskViewModel(task, tasklist);
						})));
					});
				}
			});
		}
	};
	// load tasks in the default tasklist
	Tasks.get('@default', function (items) {
		if (items.length > 0) {
			// assign temporary view model
			var defaultTasklist = new TasklistViewModel({id: '@default'});
			self.tasks($.map(items, function (item) {
				return new TaskViewModel(item, defaultTasklist);
			}));
			// extract tasklist ID from URL
			var p = new String(items[0].selfLink).split('/');
			defaultTasklistID = p[p.length - 3];
			loadAllTasklists();
		}
	});
	// load list of tasklists
	Tasklists.get(function (items) {
		if (items.length > 0) {
			self.tasklists($.map(items, function (item) {
				return new TasklistViewModel(item);
			}));
			tasklistsLoaded = true;
			loadAllTasklists();
		}
	});
};
/**
 * Tasklist view model.
 * @param {Tasklist} tasklist
 */
var TasklistViewModel = function (tasklist) {
	var self = this;
	$.each(['id', 'title', 'colorID'], function () {
		self[this] = ko.observable(tasklist[this]);
	});
};
/**
 * Task view model.
 * @param {Object} task
 * @param {TasklistViewModel} tasklist
 */
var TaskViewModel = function (task, tasklist) {
	var self = this;
	$.each(['completed', 'notes', 'status', 'title', 'updated'], function () {
		self[this] = ko.observable(task[this]);
	});
	this.due = ko.observable((function () {
		if (task.due) {
			var d = new Date(task.due);
			d.setHours(0, 0, 0, 0);
			return d;
		}
		return null;
	})());
	this.isCompleted = ko.computed({
		read: function () {
			return this.status() == 'completed';
		},
		write: function (value) {
			this.status(value ? 'completed' : 'needsAction');
		},
		owner: this
	});
	this.tasklist = ko.observable(tasklist);
};
