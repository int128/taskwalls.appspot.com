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
 * @class UI element of {@link Tasks}.
 * @param {Tasklists} tasklists the tasklists
 */
function UITasks (tasklists) {
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
UITasks.prototype.add = function (tasks) {
	var tasklists = this.tasklists;
	this.extendMonth(tasks.earliestTime());
	this.extendMonth(tasks.latestTime());
	$.each(tasks.items, function (i, task) {
		var date = new Date(task.dueTime);
		date.setHours(0, 0, 0, 0);
		$('#t' + date.getTime() + '>td.task-column').append(new UITask(task, tasklists).element);
	});
};
/**
 * Extend rows of the calendar.
 * @param {Number} time date to extend
 */
UITasks.prototype.extend = function (time) {
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
UITasks.prototype.extendMonth = function (time) {
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
UITasks.prototype.createDateRow = function (date) {
	var context = this;
	return $('<tr/>')
		.attr('id', 't' + date.getTime())
		.addClass('w' + date.getDay())
		.addClass('d' + date.getDate())
		.addClass(DateUtil.futureOrPast(date, 'future', 'today', 'past'))
		.append($('<td class="month-column"/>')
				.append($('<div/>').text(date.getMonth() + 1)))
		.append($('<td class="date-column"/>')
				.append($('<div/>').text(date.getDate())))
		.append($('<td class="weekday-column"/>')
				.append($.resource('weekday' + date.getDay())))
		.append($('<td class="task-column"/>')
				.prepend($('<div class="new-task-button">+</div>')
						.click(function (event) {
							UINewTask.open(context, date, event.pageY);
						})))
		.droppable({
			accept: 'div.task',
			tolerance: 'pointer',
			hoverClass: 'hover',
			drop: function (event, ui) {
				$(ui.draggable).css({top: 0, left: 0});
				// check if dropped row is different from last one
				if ($(ui.draggable).parents('#' + this.id).size() == 0) {
					$(ui.draggable).trigger('dropped', [$('>td.task-column', this), date]);
				}
			}
		});
};
/**
 * @class UI element of task.
 * @param task JSON task
 * @param {Tasklists} tasklists the tasklists
 */
function UITask (task, tasklists) {
	this.tasklists = tasklists;
	this.refresh(task);
}
/**
 * Refresh view.
 * @param task JSON task
 */
UITask.prototype.refresh = function (task) {
	var context = this;
	var originalElement = this.element;
	this.element = $('<div class="task"/>');
	if (originalElement) {
		$(originalElement).replaceWith(this.element);
	}
	this.task = task;
	this.element.append($.resource('task-template').children())
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
				UIUpdateTask.open(context);
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
 * @class creating task dialog
 */
function UINewTask () {};
/**
 * Open the dialog.
 * @param {UITasks} uiTasks
 * @param {Date} date due date
 * @param {Number} positionTop
 */
UINewTask.open = function (uiTasks, date, positionTop) {
	var element = $('#new-task').clone().removeAttr('id');
	var overlay = $('<div class="popup-overlay"/>');
	$('>.due>.month', element).text(date.getMonth() + 1);
	$('>.due>.day', element).text(date.getDate());
	// due time must be in UTC
	$('>form input[name="dueTime"]', element).val(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
	var tasklistsElement = $('>form>.tasklists', element).empty();
	$.each(uiTasks.tasklists.items, function (i, tasklist) {
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
	$('>form', element).unbind('change').change(function () {
		// validate the form
		var data = FormUtil.nameValueToHash($(this).serializeArray());
		if (data.title) {
			$('button', this).removeAttr('disabled');
			$(this).unbind('submit').submit(function () {
				Tasks.create($(this).serializeArray(), function (created) {
					uiTasks.add(new Tasks([created]));
					element.remove();
					overlay.remove();
				});
				return false;
			});
		}
		else {
			$('button', this).attr('disabled', 'disabled');
			$(this).unbind('submit').submit(function () {return false;});
		}
	}).change();
	overlay.appendTo('body').show().click(function () {
		element.remove();
		overlay.remove();
	});
	element.css('top', positionTop).appendTo('body').fadeIn();
	$('>form input[name="title"]', element).focus();
};
/**
 * @class updating task dialog
 */
function UIUpdateTask () {};
/**
 * Open the dialog.
 * @param {UITask} uiTask
 */
UIUpdateTask.open = function (uiTask) {
	var element = $('#update-task').clone().removeAttr('id');
	var overlay = $('<div class="popup-overlay"/>');
	var due = new Date(uiTask.task.dueTime);
	$('>.due>.month', element).text(due.getMonth() + 1);
	$('>.due>.day', element).text(due.getDate());
	// due time must be in UTC
	$('>form.update input[name="dueTime"]', element).val(due.getTime() - due.getTimezoneOffset() * 60 * 1000);
	$('>form.update input[name="title"]', element).val(uiTask.task.title);
	$('>form.update textarea[name="notes"]', element).val(uiTask.task.notes);
	$('>form.update', element).change(function () {
		// validate the form
		var data = FormUtil.nameValueToHash($(this).serializeArray());
		if (data.title) {
			$('button', this).removeAttr('disabled');
			$(this).unbind('submit').submit(function () {
				// FIXME: change to update
				Tasks.create($(this).serializeArray(), function (created) {
					uiTask.refresh(created);
					element.remove();
					overlay.remove();
				});
				return false;
			});
		}
		else {
			$('button', this).attr('disabled', 'disabled');
			$(this).unbind('submit').submit(function () {return false;});
		}
	}).change();
	$('>form.delete', element).submit(function () {
		// TODO:
	});
	overlay.appendTo('body').show().click(function () {
		element.remove();
		overlay.remove();
	});
	element.css('left', uiTask.element.position().left)
		.insertBefore(uiTask.element)
		.fadeIn();
	$('>form.update input[name="title"]', element).focus();
};