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
	this.element = $('<span/>')
		.addClass('tasklistcolor-' + tasklist.colorID)
		.text(tasklist.title)
		.appendTo($('#tasklists'));
	this.element.click(function () {
		$('.tasklist-' + tasklist.id).fadeToggle();
	});
	this.element.mouseenter(function () {
		$('#tasklist-bubble')
			.css('left', $(this).position().left)
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
	// initialize dialogs
	$('#new-task-dialog>form').submit(function () {
		return false;
	});
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
		.append($('<td class="task-column"/>'))
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
		})
		.click(function (event) {
			if ($(event.target).hasClass('task-column')) {
				$('#new-task-dialog').css({left: event.pageX, top: event.pageY}).toggle();
				$('#new-task-dialog>div.due').text(date.toLocaleDateString());
			}
			else {
				$('#new-task-dialog').hide();
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
		.draggable();
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