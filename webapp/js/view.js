/**
 * @class UI element of the header bar.
 */
function UIHeader () {
	$('#myheader .toggle-tasks.needsAction').click(function () {
		$('.task-status-needsAction').fadeToggle();
	});
	$('#myheader .toggle-tasks.completed').click(function () {
		$('.task-status-completed').fadeToggle();
	});
	$('#myheader .reload').click(function () {
		// TODO:
		return false;
	});
};
/**
 * @class UI element of {@link Tasklists}.
 */
function UITasklists () {
	$('#tasklists').empty();
	$('.tasklist-bubble').hide();
};
/**
 * Add tasklists.
 * @param {Tasklists} tasklists
 */
UITasklists.prototype.add = function (tasklists) {
	$.each(tasklists.items, function (i, tasklist) {
		var uiTasklist = new UITasklist(tasklist);
		$('#tasklists').append(uiTasklist.element);
	});
};
/**
 * UI element of the tasklist.
 * @param tasklist JSON tasklist
 */
function UITasklist (tasklist) {
	this.refresh(tasklist);
};
/**
 * Refresh view of this tasklist item.
 * @param tasklist JSON tasklist
 */
UITasklist.prototype.refresh = function (tasklist) {
	var context = this;
	this.element = $('<div class="tasklist"/>')
		.addClass('tasklistcolor-' + tasklist.colorID)
		.text(tasklist.title)
		.appendTo($('#tasklists'));
	this.element.click(function () {
		$('.tasklist-' + tasklist.id).fadeToggle();
	});
	this.element.mouseenter(function () {
		$('#tasklist-bubble')
			.css('top', $(this).position().top)
			.show()
			.mouseenter(function () {
				$(this).show().mouseleave(function () {
					$(this).hide();
				});
			});
	});
	$('#tasklist-bubble>.body>.change-color').empty();
	$.each(Constants.tasklistColorIDs(), function (i, colorID) {
		$('<span class="tasklist-mark"/>')
			.appendTo($('#tasklist-bubble>.body>.change-color'))
			.addClass('tasklistcolor-' + colorID)
			.click(function () {
				var original = tasklist.colorID;
				tasklist.colorID = colorID;
				Tasklists.updateOptions(tasklist, function () {
					$('.tasklist-' + tasklist.id)
						.removeClass('tasklistcolor-' + original)
						.addClass('tasklistcolor-' + colorID);
					context.element
						.removeClass('tasklistcolor-' + original)
						.addClass('tasklistcolor-' + colorID);
				}, function () {
					// revert
					tasklist.colorID = original;
				});
			});
	});
};
/**
 * @class UI element of the calendar.
 * @param {Tasklists} tasklists the tasklists
 */
function UICalendar (tasklists) {
	this.tasklists = tasklists;
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
	// build table with today
	$('#calendar').empty().append($('<tbody/>'));
	this.extendMonth(this.earliest);
};
/**
 * Add tasks.
 * @param {Tasks} tasks array of JSON task
 */
UICalendar.prototype.add = function (tasks) {
	var tasklists = this.tasklists;
	this.extendMonth(tasks.earliestTime());
	this.extendMonth(tasks.latestTime());
	$.each(tasks.items, function (i, task) {
		new UITask(task, tasklists);
	});
};
/**
 * Extend rows of the calendar.
 * @param {Number} time date to extend
 */
UICalendar.prototype.extend = function (time) {
	var date = new Date(time);
	date.setHours(0, 0, 0, 0);
	if (date < this.earliest) {
		while (this.earliest >= date) {
			this.earliest = new Date(this.earliest.getTime() - 86400000);
			$('#calendar>tbody').prepend(this.createDateRow(this.earliest));
		}
	}
	else if (date > this.latest) {
		while (this.latest <= date) {
			this.latest = new Date(this.latest.getTime() + 86400000);
			$('#calendar>tbody').append(this.createDateRow(this.latest));
		}
	}
};
/**
 * Extend rows of the calendar.
 * @param {Number} time date to extend
 */
UICalendar.prototype.extendMonth = function (time) {
	var date = new Date(time);
	date.setHours(0, 0, 0, 0);
	date.setDate(1);
	this.extend(date.getTime());
	date.setMonth(date.getMonth() + 1);
	this.extend(date.getTime());
};
/**
 * Create a table row of date.
 * @param {Date} date date (time parts must be zero)
 * @returns {jQuery}
 */
UICalendar.prototype.createDateRow = function (date) {
	var context = this;
	var row = $('<tr/>')
		.addClass('t' + date.getTime())
		.addClass('w' + date.getDay())
		.addClass('d' + date.getDate())
		.addClass(DateUtil.futureOrPast(date, 'future', 'today', 'past'))
		.append($('<td class="month-column"/>')
				.append($('<div/>').text(date.getMonth() + 1)))
		.append($('<td class="date-column"/>')
				.append($('<div/>').text(date.getDate())))
		.append($('<td class="weekday-column"/>')
				.append($.resource('key-weekday' + date.getDay())))
		.append($('<td class="task-column"/>')
				.prepend($('<div class="new-task-button">+</div>')
						.click(function (event) {
							new UINewTask().open(context, date, event.pageY);
						})))
		.droppable({
			accept: 'div.task',
			tolerance: 'pointer',
			hoverClass: 'hover',
			drop: function (event, ui) {
				$(ui.draggable).css({top: 0, left: 0});
				// check if dropped row is different from last one
				if ($(ui.draggable).parents('.t' + date.getTime()).size() == 0) {
					$(ui.draggable).trigger('dropped', [$('>td.task-column', this), date]);
				}
			}
		});
	if (row.hasClass('today')) {
		row.attr('id', 'today');
	}
	return row;
};
/**
 * @class UI element of the task.
 * @param task JSON task
 * @param {Tasklists} tasklists the tasklists
 */
function UITask (task, tasklists) {
	this.tasklists = tasklists;
	this.refresh(task);
}
/**
 * Refresh the element.
 * @param task JSON task
 */
UITask.prototype.refresh = function (task) {
	var context = this;
	var originalElement = this.element;
	this.element = $.resource('task-template');
	this.task = task;
	// append or move the element to due date row
	var due = new Date(task.dueTime);
	due.setHours(0, 0, 0, 0);
	if ($(originalElement).parents('.t' + due.getTime()).size() > 0) {
		$(originalElement).replaceWith(this.element);
	}
	else {
		$(originalElement).remove();
		$('.t' + due.getTime() + '>td.task-column').append(this.element);
	}
	// build inner elements
	this.element
		.addClass('task-status-' + task.status)
		.addClass('tasklist-' + task.tasklistID)
		.addClass('tasklistcolor-' + this.tasklists.getByID(task.tasklistID).colorID)
		/**
		 * Updates task due time when dropped on another row.
		 * @param {Element} column column dropped on
		 * @param {Date} date
		 */
		.bind('dropped', function (event, column, date) {
			var originalDueTime = task.dueTime;
			// due time must be in UTC
			task.dueTime = date.getTime() - date.getTimezoneOffset() * 60 * 1000;
			var oldplace = context.element.wrap('<div/>').parent();
			context.element.addClass('ajax-in-progress').appendTo($(column));
			Tasks.updateDueTime(task, function (updated) {
				oldplace.remove();
				context.refresh(updated);
			}, function () {
				// restore previous state
				task.dueTime = originalDueTime;
				context.element.appendTo(oldplace).unwrap();
				context.refresh(task);
			});
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
				new UIUpdateTask().open(context);
			}
		});
	$('>input.status_completed', this.element)
		.change(function () {
			// updates task status when checkbox changed
			task.status_completed = this.checked;
			Tasks.updateStatus(task, function (updated) {
				context.refresh(updated);
			}, function () {
				context.refresh(task);
			});
			context.element.addClass('ajax-in-progress');
		});
	if (task.status == 'completed') {
		$('>input.status_completed', this.element).attr('checked', 'checked');
	}
	$('>span.title', this.element).text(task.title)
		.click(function () {
			// updates task title when title clicked
			var height = $(this).height();
			context.element.empty();
			$('<textarea class="title"/>')
				.val(task.title)
				.height(height)
				.appendTo(context.element)
				.blur(function () {
					if ($(this).val() && $(this).val() != task.title) {
						var original = task.title;
						task.title = $(this).val();
						$(this).attr('disabled', 'disabled');
						Tasks.updateTitle(task, function (updated) {
							context.refresh(updated);
						}, function () {
							task.title = original;
							context.refresh(task);
						});
						context.element.addClass('ajax-in-progress');
					}
					else {
						context.refresh(task);
					}
				})
				.keydown(function (event) {
					if (event.keyCode == 27) { // ESC
						context.refresh(task);
					}
					else if (event.keyCode == 13) { // Enter
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
function UINewTask () {
	this.element = $.resource('new-task-template');
	this.overlay = $.resource('popup-overlay-template');
};
/**
 * Open the dialog.
 * @param {UICalendar} uiCalendar
 * @param {Date} date due date
 * @param {Number} positionTop
 */
UINewTask.prototype.open = function (uiCalendar, date, positionTop) {
	var context = this;
	$('>form button', this.element).button();
	$('>form .due>.month', this.element).text(date.getMonth() + 1);
	$('>form .due>.day', this.element).text(date.getDate());
	// due time must be in UTC
	$('>form input[name="dueTime"]', this.element).val(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
	var tasklistsElement = $('>form>.tasklists', this.element).empty();
	$.each(uiCalendar.tasklists.items, function (i, tasklist) {
		var checked = {};
		if (i == 0) {
			checked = {checked: 'checked'};
		}
		var labelId = Math.random() + tasklist.id;
		$('<div/>').appendTo(tasklistsElement)
			.append($('<input type="radio" name="tasklistID"/>')
				.attr(checked)
				.attr('id', labelId)
				.val(tasklist.id)
				.appendTo(tasklistsElement))
			.append($('<label/>')
				.attr('for', labelId)
				.text(tasklist.title)
				.appendTo(tasklistsElement));
	});
	$('>form', this.element).unbind('change').change(function () {
		// validate the form
		var button = $('button', this);
		if ($('input[name="title"]', this).val()) {
			button.removeAttr('disabled');
		}
		else {
			button.attr('disabled', 'disabled');
		}
	}).change().submit(function () {
		var button = $('button', this);
		if (button.attr('disabled') == undefined) {
			button.attr('disabled', 'disabled');
			Tasks.create($(this).serializeArray(), function (created) {
				uiCalendar.add(new Tasks([created]));
				context.element.remove();
				context.overlay.remove();
			}, function () {
				button.removeAttr('disabled');
			});
		}
		return false;
	});
	this.overlay.appendTo('body').show().click(function () {
		context.element.remove();
		context.overlay.remove();
	});
	this.element.css('top', positionTop).appendTo('body').fadeIn();
	$('>form input[name="title"]', this.element).focus();
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
 */
UIUpdateTask.prototype.open = function (uiTask) {
	var context = this;
	this.setDue(new Date(uiTask.task.dueTime));
	$('>.forms>form button', this.element).button();
	$('>.forms>form input[name="id"]', this.element).val(uiTask.task.id);
	$('>.forms>form input[name="tasklistID"]', this.element).val(uiTask.task.tasklistID);
	$('>.datepicker', this.element).datepicker({
		defaultDate: context.getDue(),
		dateFormat: '@',
		onSelect: function (timeInMillis) {
			context.setDue(new Date(parseInt(timeInMillis)));
		}
	});
	$('>.forms>form.update input[name="title"]', this.element).val(uiTask.task.title);
	$('>.forms>form.update textarea[name="notes"]', this.element).val(uiTask.task.notes);
	$('>.forms>form.update', this.element).change(function () {
		// validate the form
		var button = $('button', this);
		if ($('input[name="title"]', this).val()) {
			button.removeAttr('disabled');
		}
		else {
			button.attr('disabled', 'disabled');
		}
	}).change().submit(function () {
		var button = $('button', this);
		if (button.attr('disabled') == undefined) {
			button.attr('disabled', 'disabled');
			$('input[name="dueTime"]', this).val(context.getDueUTC());
			Tasks.update($(this).serializeArray(), function (created) {
				uiTask.refresh(created);
				context.element.remove();
				context.overlay.remove();
			}, function () {
				button.removeAttr('disabled');
			});
		}
		return false;
	});
	$('>.forms>form.delete', this.element).submit(function () {
		var button = $('button', this);
		button.attr('disabled', 'disabled');
		Tasks.deleteOne($(this).serializeArray(), function () {
			uiTask.remove();
			context.element.remove();
			context.overlay.remove();
		}, function () {
			button.removeAttr('disabled');
		});
		return false;
	});
	this.overlay.appendTo('body').show().click(function () {
		context.element.remove();
		context.overlay.remove();
	});
	this.element.css('left', uiTask.element.position().left)
		.insertBefore(uiTask.element)
		.fadeIn();
	$('>.forms>form.update input[name="title"]', this.element).focus();
};
/**
 * Set the due date.
 * @param {Date} due
 */
UIUpdateTask.prototype.setDue = function (due) {
	this.due = due;
	$('>.forms>form.update>.due>.year', this.element).text(due.getFullYear());
	$('>.forms>form.update>.due>.month', this.element).text(due.getMonth() + 1);
	$('>.forms>form.update>.due>.day', this.element).text(due.getDate());
};
/**
 * Get the due date.
 * @returns {Date}
 */
UIUpdateTask.prototype.getDue = function () {
	return this.due;
};
/**
 * Get the due date in UTC.
 * @returns {Number}
 */
UIUpdateTask.prototype.getDueUTC = function () {
	return this.due.getTime() - this.due.getTimezoneOffset() * 60 * 1000;
};