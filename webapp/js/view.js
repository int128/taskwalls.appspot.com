/**
 * @class UI element of {@link Tasklists}.
 * @param {Tasklists} tasklists tasklist JSON
 */
function UITasklists (tasklists) {
	$('#tasklists').empty();
	$('.tasklist-bubble').hide();
	var onColorChanged = this.onColorChanged;
	$.each(tasklists.items, function (i, tasklist) {
		var uiTasklist = new UITasklist(tasklist);
		uiTasklist.onColorChanged = onColorChanged;
		$('#tasklists').append(uiTasklist.element);
	});
};
/**
 * Tasklist color has been changed via UI.
 * @param tasklist tasklist JSON (colorID property has been updated)
 */
UITasklists.prototype.onColorChanged = function (tasklist) {};
/**
 * UI element of the tasklist.
 * @param tasklist JSON tasklist
 */
function UITasklist (tasklist) {
	this.refresh(tasklist);
};
/**
 * Tasklist color has been changed via UI.
 * @param tasklist tasklist JSON (colorID property has been updated)
 */
UITasklist.prototype.onColorChanged = function (tasklist) {};
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
		$('.tasklist-bubble>.body>.change-color>.tasklist-mark')
			.unbind('click')
			.click(function () {
				tasklist.colorID = context.changeColorTo(this);
				context.onColorChanged(tasklist);
			});
		$('.tasklist-bubble')
			.css('left', $(this).position().left)
			.show()
			.mouseenter(function () {
				$(this).show().mouseleave(function () {
					$(this).hide();
				});
			});
	});
};
/**
 * Change this element to be same color as the reference element.
 * @param {Element} reference element which has class .tasklistcolor-*
 * @returns {Number} color ID
 */
UITasklist.prototype.changeColorTo = function (reference) {
	var colorID = undefined;
	for (var i = 0; i < Constants.tasklistColors; i++) {
		if ($(reference).hasClass('tasklistcolor-' + i)) {
			this.element.addClass('tasklistcolor-' + i);
			colorID = i;
		}
		else {
			this.element.removeClass('tasklistcolor-' + i);
		}
	}
	return colorID;
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
		});
};
/**
 * Apply specified color to these tasks.
 * @param tasklist JSON tasklist (colorID property must be set)
 */
UITasks.prototype.applyTasklistColor = function (tasklist) {
	for (var i = 0; i < Constants.tasklistColors; i++) {
		$('.tasklist-' + tasklist.id).removeClass('tasklistcolor-' + i);
	}
	$('.tasklist-' + tasklist.id).addClass('tasklistcolor-' + tasklist.colorID);
};
/**
 * @class UI element of task.
 * @param {Object} task JSON task
 * @param {Tasklists} tasklists the tasklists
 */
function UITask (task, tasklists) {
	this.tasklists = tasklists;
	this.refresh(task);
}
/**
 * Refresh view.
 * @param {Object} task JSON task
 */
UITask.prototype.refresh = function (task) {
	var context = this;
	(function () {
		var originalElement = context.element;
		context.element = $('<div class="task"/>');
		if (originalElement) {
			$(originalElement).replaceWith(context.element);
		}
	})();
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
				context.element.remove();
				context.element = oldplace;
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
		})
		.click(function () {
			// prevent from bubbling for task click
			return false;
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
			// prevent from bubbling for task click
			return false;
		});
	if (task.notes) {
		$('>div.notes', this.element).text(task.notes);
	}
};