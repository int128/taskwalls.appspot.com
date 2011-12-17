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
	$('#calendar>tbody').empty();
	this.extendMonth(this.earliest);
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
		while (this.earliest >= date) {
			this.earliest = new Date(this.earliest.getTime() - 86400000);
			$('#calendar>tbody').prepend(this.createDateRow(this.earliest));
		}
	}
	else if (date > this.latest) {
		while (this.latest < date) {
			this.latest = new Date(this.latest.getTime() + 86400000);
			$('#calendar>tbody').append(this.createDateRow(this.latest));
		}
	}
	// next month link
	var next = $.resource('calendar-next-template');
	$('.year', next).text(this.latest.getFullYear());
	$('.month', next).text(this.latest.getMonth() + 1);
	$('a', next).click(function () {
		context.extendMonth(context.latest.getTime());
		return false;
	});
	$('#calendar-next').empty().append(next);
};
/**
 * Extend rows of the calendar.
 * @param {Number} time date to extend
 */
UICalendar.prototype.extendMonth = function (time) {
	var date = new Date(time);
	this.extend(date.getTime());
	date.setHours(0, 0, 0, 0);
	date.setMonth(date.getMonth() + 1);
	date.setDate(1);
	this.extend(date.getTime());
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
	$('.month-column>div', row).text(date.getMonth() + 1);
	$('.date-column>div', row).text(date.getDate());
	$('.weekday-column', row).append($.resource('key-weekday' + date.getDay()));
	$('.new-task-button', row).click(function (event) {
		new UINewTask().open(context, date, event.pageY);
	});
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
	this.task = task;
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
	var context = this;
	var originalElement = this.element;
	this.element = $.resource('task-template');
	this.task = task;
	// append or move the element to due date row
	var rowTime = 0;
	if (task.dueDate) {
		rowTime = task.dueDate.getTime();
	}
	$(originalElement).remove();
	var taskGroup = $('.t' + rowTime + '>.task-column>.taskgroup-tasklistID-' + task.tasklistID);
	if (taskGroup.size() == 0) {
		taskGroup = $('<div class="taskgroup"/>').addClass('taskgroup-tasklistID-' + task.tasklistID);
		$('.t' + rowTime + '>.task-column').append(taskGroup);
	}
	taskGroup.append(this.element);
	// build inner elements
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
			$('input[name="dueTime"]', form).val(DateUtil.getUTCTime(date));
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
	$('>form input[name="dueTime"]', this.element).val(DateUtil.getUTCTime(date));
	new UITasklistButtonSet($('>form>.tasklists', this.element), 'tasklistID')
		.onSelect(function () {
			$('>form input[name="title"]', context.element).focus();
		})
		.add(uiCalendar.tasklists)
		.selectFirst();
	new FormController($('>form', this.element))
		.validator(function (form) {
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
UINewTask.prototype.close = function () {
	this.element.remove();
	this.overlay.remove();
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
	// FIXME: only not "due-none" tasks
	$('.datepicker', this.element).datepicker({
		defaultDate: context.getDue(),
		dateFormat: '@',
		onSelect: function (timeInMillis) {
			context.setDue(new Date(parseInt(timeInMillis)));
		}
	});
	new FormController($('>.forms>form.update', this.element))
		.copyProperties(uiTask.getTask())
		.validator(function (form) {
			if (context.getDue()) {
				$('input[name="dueTime"]', form).val(DateUtil.getUTCTime(context.getDue()));
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
	// delete the task
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
	// move the task to some tasklist
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
 * @param {Date} due
 */
UIUpdateTask.prototype.setDue = function (due) {
	this.due = due;
	if (due) {
		$('>.forms>form.update>.due>.year', this.element).text(due.getFullYear());
		$('>.forms>form.update>.due>.month', this.element).text(due.getMonth() + 1);
		$('>.forms>form.update>.due>.day', this.element).text(due.getDate());
		$('>.forms>form.update>.due', this.element).show();
		$('>.forms>form.update>.due-none', this.element).hide();
	}
	else {
		$('>.forms>form.update>.due', this.element).hide();
		$('>.forms>form.update>.due-none', this.element).show();
	}
};
/**
 * Get the due date.
 * @returns {Date}
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
