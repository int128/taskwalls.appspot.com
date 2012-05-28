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
 * @param {Number} or {Date} time time to extend
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
 * @param {Number} or {Date} time time to extend
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
var TasklistViewModel = function (tasklist) {
	var self = this;
	$.each(['id', 'title', 'colorID'], function () {
		self[this] = ko.observable(tasklist[this]);
	});
};
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
	this.tasklist = ko.observable(tasklist);
};


// FIXME: remove below
/**
 * @class UI element of the calendar.
 */
function UICalendar () {
	this.tasklists = new Tasklists([]);
	/**
	 * Latest date in the calendar.
	 * @type Date
	 */
	this.latest = new Date();
	this.latest.setHours(0, 0, 0, 0);
	/**
	 * Earliest date in the calendar.
	 * @type Date
	 */
	this.earliest = new Date();
	this.earliest.setHours(24, 0, 0, 0);
	// build table rows
	$('#calendar tbody').empty();
	this.extendMonth(this.earliest);
	var context = this;
	// planner
	$('#planner').droppable({
		accept: '.task',
		tolerance: 'pointer',
		hoverClass: 'hover',
		drop: function (event, ui) {
			$(ui.draggable).css({top: 0, left: 0});
			// check if dropped row is different from last one
			if ($(ui.draggable).parents('#planner').size() == 0) {
				$(ui.draggable).trigger('dropped', [this, null]);
			}
		}
	});
	$('#planner a[href="#create-task"]').click(function (event) {
		new UICreateTask().open(context, null, event.pageY);
		return false;
	});
};
/**
 * Clear tasks in the calendar.
 */
UICalendar.prototype.clear = function () {
	$('#calendar .task').remove();
};
/**
 * Add tasks.
 * @param {Tasks} tasks tasks
 */
UICalendar.prototype.add = function (tasks) {
	var context = this;
	this.extendMonth(tasks.earliestTime());
	this.extendMonth(tasks.latestTime());
	$.each(tasks.items, function (i, task) {
		new UITask(task, context);
	});
};
/**
 * Get the tasklists.
 * @returns {Tasklists}
 */
UICalendar.prototype.getTasklists = function () {
	return this.tasklists;
};
/**
 * Set a tasklists.
 * @param {Tasklists} tasklists
 */
UICalendar.prototype.setTasklists = function (tasklists) {
	this.tasklists = tasklists;
};
/**
 * Extend rows of the calendar.
 * @param {Number} time date to extend
 */
UICalendar.prototype.extend = function (time) {
	var context = this;
	var date = new Date(time);
	date.setHours(0, 0, 0, 0);
	if (date < this.earliest) {
		while (this.earliest > date) {
			this.earliest = new Date(this.earliest.getTime() - 86400000);
			$('#calendar tbody').prepend(this.createDateRow(this.earliest));
		}
	}
	else if (date > this.latest) {
		while (this.latest < date) {
			this.latest = new Date(this.latest.getTime() + 86400000);
			$('#calendar tbody').append(this.createDateRow(this.latest));
		}
	}
	// next month link
	$('.calendar-next .year').text(this.latest.getFullYear());
	$('.calendar-next .month').text(this.latest.getMonth() + 1);
	$('.calendar-next a').unbind('click').click(function () {
		context.extendMonth(context.latest.getTime());
		return false;
	});
};
/**
 * Extend rows of the calendar.
 * @param {Number} time date to extend
 */
UICalendar.prototype.extendMonth = function (time) {
	// (from) yesterday
	var fromDate = new Date(time);
	fromDate.setHours(-24, 0, 0, 0);
	this.extend(fromDate.getTime());
	// (to) first day in next month
	var toDate = new Date(time);
	toDate.setHours(0, 0, 0, 0);
	toDate.setMonth(toDate.getMonth() + 1);
	toDate.setDate(1);
	this.extend(toDate.getTime());
};
/**
 * Create a table row of date.
 * @param {Date} date date (time parts must be zero)
 * @returns {jQuery}
 */
UICalendar.prototype.createDateRow = function (date) {
	var context = this;
	var row = $.resource('task-row-template')
		.addClass('t' + date.getTime())
		.addClass('w' + date.getDay())
		.addClass('d' + date.getDate())
		.addClass(DateUtil.futureOrPast(date, 'future', 'today', 'past'))
		.droppable({
			accept: '.task',
			tolerance: 'pointer',
			hoverClass: 'hover',
			drop: function (event, ui) {
				$(ui.draggable).css({top: 0, left: 0});
				// check if dropped row is different from last one
				if ($(ui.draggable).parents('.t' + date.getTime()).size() == 0) {
					$(ui.draggable).trigger('dropped', [$('.task-column', this), date]);
				}
			}
		});
	$('.month-column>div', row).text(date.getMonth() + 1);
	$('.date-column>div', row).text(date.getDate());
	$('.weekday-column', row).append($.resource('key-weekday' + date.getDay()));
	// TODO: change to live() method; use data?
	$('a[href="#create-task"]', row).click(function (event) {
		new UICreateTask().open(context, date, event.pageY);
		return false;
	});
	if (DateUtil.isThisWeek(date)) {
		row.addClass('thisweek');
	}
	if (row.hasClass('today')) {
		row.attr('id', 'today');
	}
	return row;
};
/**
 * @class UI element of the task.
 * @param {Task} task JSON task
 * @param {UICalendar} uiCalendar
 */
function UITask (task, uiCalendar) {
	this.uiCalendar = uiCalendar;
	this.refresh(task);
}
/**
 * Get the element.
 * @returns {Element}
 */
UITask.prototype.getElement = function () {
	return this.element;
};
/**
 * Enter AJAX state.
 */
UITask.prototype.enterAjax = function () {
	this.element.addClass('ajax-in-progress');
};
/**
 * Leave AJAX state.
 */
UITask.prototype.leaveAjax = function () {
	this.element.removeClass('ajax-in-progress');
};
/**
 * Get the task.
 */
UITask.prototype.getTask = function () {
	return this.task;
};
/**
 * Refresh the element.
 * @param {Task} task the task
 */
UITask.prototype.refresh = function (task) {
	// replace or append new element
	(function () {
		var originalElement = this.element;
		var originalTask = this.task;
		this.element = $.resource('task-template');
		this.task = task;
		if (originalTask &&
			DateUtil.getTimeOrZero(originalTask.dueDate) == DateUtil.getTimeOrZero(task.dueDate) &&
			originalTask.tasklistID == task.tasklistID) {
			// replace the element if same date and same tasklist
			$(originalElement).replaceWith(this.element);
		}
		else {
			// remove and append new element
			var rowTime = DateUtil.getTimeOrZero(task.dueDate);
			var taskColumn = $('.t' + rowTime + '>.task-column');
			var taskGroup = $('.taskgroup-tasklistID-' + task.tasklistID, taskColumn);
			if (taskGroup.size() == 0) {
				// create task group if not exists
				taskGroup = $('<div/>')
					.addClass('taskgroup')
					.addClass('taskgroup-tasklistID-' + task.tasklistID);
				taskColumn.append(taskGroup);
			}
			$(originalElement).remove();
			taskGroup.append(this.element);
		}
	}).apply(this);
	// build inner elements
	var context = this;
	this.element
		.addClass('task-status-' + task.status)
		.addClass('task-tasklistID-' + task.tasklistID)
		.addClass('tasklistcolor-' + this.uiCalendar.getTasklists().getByID(task.tasklistID).colorID)
		/**
		 * Updates task due time when dropped on another row.
		 * @param {Element} column column dropped on
		 * @param {Date} date
		 */
		.bind('dropped', function (event, column, date) {
			$(this).append($.resource('update-task-due-template'));
			var form = $('form', this);
			var oldplace = $(this).wrap('<div/>').parent();
			new FormController(form)
				.copyProperties(task)
				.success(function (updated) {
					oldplace.remove();
					context.refresh(new Task(updated));
				})
				.error(function () {
					context.element.appendTo(oldplace).unwrap();
					context.refresh(task);
				});
			if (date) {
				$('input[name="dueTime"]', form).val(date.getUTCTime());
			}
			else {
				$('input[name="dueTime"]', form).val(0);
			}
			$(this).appendTo($(column));
			context.enterAjax();
			$(form).submit();
		})
		.draggable({
			scroll: true
		})
		/**
		 * Opens edit dialog when task clicked.
		 * @param event
		 */
		.click(function (event) {
			if ($(event.target).hasClass('task')) {
				new UIUpdateTask().open(context, context.uiCalendar);
			}
		});
	$('>input[name="statusIsCompleted"]', this.element)
		.change(function () {
			// updates task status when checkbox changed
			$(context.element).append($.resource('update-task-status-template'));
			var form = $('form', context.element);
			new FormController(form)
				.copyProperties(task)
				.success(function (updated) {
					context.refresh(new Task(updated));
				})
				.error(function () {
					context.refresh(task);
				});
			if (this.checked) {
				$('input[name="status"]', form).val('completed');
			}
			else {
				$('input[name="status"]', form).val('needsAction');
			}
			context.enterAjax();
			$(form).submit();
		});
	if (task.status == 'completed') {
		$('>input[name="statusIsCompleted"]', this.element).attr('checked', 'checked');
	}
	$('>span.title', this.element).text(task.title)
		.click(function () {
			// updates task title when title clicked
			var height = $(this).height();
			context.element.empty().append($.resource('update-task-title-template'));
			var form = $('form', context.element);
			var formController = new FormController(form)
				.copyProperties(task)
				.validator(function () {
					var value = $('textarea[name="title"]', form).val();
					return value && value != task.title;
				})
				.success(function (updated) {
					context.refresh(new Task(updated));
				})
				.error(function () {
					context.refresh(task);
				})
				.cancel(function () {
					context.refresh(task);
				});
			$('textarea[name="title"]', context.element)
				.height(height)
				.blur(function () {
					if (formController.validate(form)) {
						context.enterAjax();
						$(form).submit();
					}
					else {
						formController.cancelHandler();
					}
				})
				.keydown(function (event) {
					// cancel will be processed in the form controller
					if (event.keyCode == 13) { // Enter
						$(this).blur();
						return false;
					}
				})
				.focus()
				.select();
		});
	if (task.notes) {
		$('>div.notes', this.element).text(task.notes);
	}
	// TODO: revise dependencies
	$('.toggle-tasks.completed .count').text(
		$('tr.thisweek .task.task-status-completed').size());
	$('.toggle-tasks.needsAction .count').text(
		$('tr.thisweek .task.task-status-needsAction').size());
};
/**
 * Remove the task.
 */
UITask.prototype.remove = function () {
	this.element.remove();
};
/**
 * @class creating task dialog
 */
function UICreateTask () {
	this.element = $.resource('create-task-template');
	this.overlay = $.resource('popup-overlay-template');
};
/**
 * Open the dialog.
 * @param {UICalendar} uiCalendar
 * @param {Date} date due date (may be null)
 * @param {Number} positionTop
 */
UICreateTask.prototype.open = function (uiCalendar, date, positionTop) {
	var context = this;
	$('>form button', this.element).button();
	this.setDue(date);
	new UITasklistButtonSet($('>form>.tasklists', this.element), 'tasklistID')
		.onSelect(function () {
			$('>form input[name="title"]', context.element).focus();
		})
		.add(uiCalendar.tasklists)
		.selectFirst();
	new FormController($('>form', this.element))
		.validator(function (form) {
			if (context.getDue()) {
				$('input[name="dueTime"]', form).val(context.getDue().getUTCTime());
			}
			else {
				$('input[name="dueTime"]', form).val(0);
			}
			return $('input[name="title"]', form).val();
		})
		.success(function (created) {
			uiCalendar.add(new Tasks([new Task(created)]));
			context.close();
		})
		.cancel(function () {
			context.close();
		});
	this.overlay.appendTo('body').show().click(function () {
		context.close();
	});
	this.element
		.css('top', positionTop)
		.appendTo('body')
		.show();
	$('>form input[name="title"]', this.element).focus();
};
/**
 * Close the dialog.
 */
UICreateTask.prototype.close = function () {
	this.element.remove();
	this.overlay.remove();
};
/**
 * Set the due date.
 * @param {Date} due due date (may be null)
 */
UICreateTask.prototype.setDue = function (due) {
	this.due = due;
	if (due) {
		$('.due>.year', this.element).text(due.getFullYear());
		$('.due>.month', this.element).text(due.getMonth() + 1);
		$('.due>.day', this.element).text(due.getDate());
		this.element.removeClass('due-tbd');
	}
	else {
		this.element.addClass('due-tbd');
	}
};
/**
 * Get the due date.
 * @returns {Date} due date (may be null)
 */
UICreateTask.prototype.getDue = function () {
	return this.due;
};
/**
 * @class updating task dialog
 */
function UIUpdateTask () {
	this.element = $.resource('update-task-template');
	this.overlay = $.resource('popup-overlay-template');
};
/**
 * Open the dialog.
 * @param {UITask} uiTask
 * @param {UICalendar} uiCalendar
 */
UIUpdateTask.prototype.open = function (uiTask, uiCalendar) {
	var context = this;
	this.setDue(uiTask.getTask().dueDate);
	$('>.forms>form button', this.element).button();
	// update the task
	$('.datepicker', this.element).datepicker({
		defaultDate: context.getDue(),
		dateFormat: '@',
		onSelect: function (timeInMillis) {
			context.setDue(new Date(parseInt(timeInMillis)));
		}
	});
	// form for updating the task
	new FormController($('>.forms>form.update', this.element))
		.copyProperties(uiTask.getTask())
		.validator(function (form) {
			if (context.getDue()) {
				$('input[name="dueTime"]', form).val(context.getDue().getUTCTime());
			}
			else {
				$('input[name="dueTime"]', form).val(null);
			}
			return $('input[name="title"]', form).val();
		})
		.success(function (created) {
			uiTask.refresh(new Task(created));
			context.close();
		})
		.cancel(function () {
			context.close();
		});
	// form for deleting the task
	new FormController($('>.forms>form.delete', this.element))
		.copyProperties(uiTask.getTask())
		.success(function () {
			uiTask.remove();
			context.close();
		});
	$('.confirm', this.element).hide();
	$('a[href="#delete"]', this.element).click(function () {
		$(this).hide();
		$('.confirm', this.element).show();
		return false;
	});
	// form for moving the task to another tasklist
	new UITasklistButtonSet($('>.forms>form.move>.tasklists', this.element), 'destinationTasklistID')
		.onSelect(function () {
			$('>.forms>form.update input[name="title"]', context.element).focus();
		})
		.add(uiCalendar.getTasklists())
		.select(uiTask.getTask().tasklistID);
	new FormController($('>.forms>form.move', this.element))
		.copyProperties(uiTask.getTask())
		.success(function (moved) {
			uiTask.refresh(new Task(moved));
			context.close();
		});
	this.overlay.appendTo('body').show().click(function () {
		context.close();
	});
	this.element
		.insertBefore(uiTask.getElement())
		.show();
	$('>.forms>form.update input[name="title"]', this.element).focus();
};
/**
 * Close the dialog.
 */
UIUpdateTask.prototype.close = function () {
	this.element.remove();
	this.overlay.remove();
};
/**
 * Set the due date.
 * @param {Date} due due date (may be null)
 */
UIUpdateTask.prototype.setDue = function (due) {
	this.due = due;
	if (due) {
		$('.due>.year', this.element).text(due.getFullYear());
		$('.due>.month', this.element).text(due.getMonth() + 1);
		$('.due>.day', this.element).text(due.getDate());
		this.element.removeClass('due-tbd');
	}
	else {
		this.element.addClass('due-tbd');
	}
};
/**
 * Get the due date.
 * @returns {Date} due date (may be null)
 */
UIUpdateTask.prototype.getDue = function () {
	return this.due;
};
/**
 * @class button set of tasklists
 * @param {Element} element parent element
 * @param {String} name form parameter name
 */
function UITasklistButtonSet (element, name) {
	this.element = element;
	this.name = name;
	this.uniqueID = new Date().getTime();
	$(element).empty().addClass('tasklists').change(function () {
		$('input:radio', this).each(function () {
			$(element).find('label[for=' + this.id + ']').toggleClass('selected', this.checked);
		});
	}).change();
};
/**
 * Add tasklists.
 * @param {Tasklists} tasklists
 * @return {UITasklistButtonSet}
 */
UITasklistButtonSet.prototype.add = function (tasklists) {
	var context = this;
	$.each(tasklists.items, function (i, tasklist) {
		$(context.element)
			.append($('<input type="radio"/>')
				.attr('name', context.name)
				.attr('id', context.uniqueID + tasklist.id)
				.val(tasklist.id))
			.append($('<label class="tasklist"/>')
				.attr('for', context.uniqueID + tasklist.id)
				.addClass('tasklistcolor-' + tasklists.getByID(tasklist.id).colorID)
				.text(tasklist.title));
	});
	return this;
};
/**
 * Select the tasklist.
 * @param {String} tasklistID
 * @returns {UITasklistButtonSet}
 */
UITasklistButtonSet.prototype.select = function (tasklistID) {
	$(this.element).find('#' + this.uniqueID + tasklistID).click().change();
	return this;
};
/**
 * Select first item.
 * @returns {UITasklistButtonSet}
 */
UITasklistButtonSet.prototype.selectFirst = function () {
	$('input:first', this.element).click().change();
	return this;
};
/**
 * Set the handler for selected event.
 * @param {Function} handler
 * @returns {UITasklistButtonSet}
 */
UITasklistButtonSet.prototype.onSelect = function (handler) {
	$(this.element).change(handler);
	return this;
};
