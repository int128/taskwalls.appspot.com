/*
 * app.js
 * (c) hidetake.org, 2011.
 */

// models
/**
 * @class represents tasklists model
 * @param {Array} items array of tasklist
 */
function Tasklists (items) {
	this.items = items;
};
/**
 * Get {@link Tasklists} from server.
 * @param {Function} callback async callback function
 */
Tasklists.get = function (callback) {
	$.get('tasklists/list', null, function (response) {
		var instance = new Tasklists(response.items);
		if ($.isFunction(callback)) {
			callback(instance);
		}
	});
};
/**
 * @class represents tasks model
 * @param {String} tasklistID task list ID
 * @param {Array} items
 * @param {Array} tags
 * @property {String} tasklistID task list ID
 * @property {Array} items
 * @property {Array} tags
 */
function Tasks (tasklistID, items, tags) {
	this.tasklistID = tasklistID;
	this.items = items;
	this.tags = tags;
};
/**
 * Get tasks from server.
 * @param {String} tasklistID task list ID
 * @param {Function} callback async callback function
 */
Tasks.get = function (tasklistID, callback) {
	$.get('tasks/list', {tasklistID: tasklistID}, function (response) {
		var instance = new Tasks(tasklistID, response.items, response.tags);
		if ($.isFunction(callback)) {
			callback(instance);
		}
	});
};
/**
 * Update status of task.
 * @param task JSON task
 * @param {Function} callback
 */
Tasks.updateStatus = function (task, callback) {
	$.post('tasks/update/status', task, callback);
};
/**
 * Get tasks in default tasklist from server.
 * @param {Function} async callback function
 */
Tasks.getDefault = function (callback) {
	Tasks.get('@default', callback);
};
/**
 * @returns {Number} latest date in tasks
 */
Tasks.prototype.latestTime = function () {
	if (this.items.length == 0) {
		return new Date().getTime();
	}
	var maxTime = -Infinity;
	$.each(this.items, function (i, task) {
		if (task.dueTime > maxTime) {
			maxTime = task.dueTime;
		}
	});
	return maxTime;
};
/**
 * @returns {Number} earliest date in tasks
 */
Tasks.prototype.earliestTime = function () {
	if (this.items.length == 0) {
		return new Date().getTime();
	}
	var minTime = Infinity;
	$.each(this.items, function (i, task) {
		if (task.dueTime < minTime) {
			minTime = task.dueTime;
		}
	});
	return minTime;
};
/**
 * Get array of date from earliest to latest date in tasks.
 * @param {Number} marginDays
 * @returns {Array} array of {@link Date}
 */
Tasks.prototype.days = function (marginDays) {
	if (marginDays == undefined) {
		marginDays = 0;
	}
	var minTime = this.earliestTime() - marginDays * 86400000;
	var maxTime = this.latestTime() + marginDays * 86400000;
	var result = [];
	for (var time = minTime; time <= maxTime; time += 86400000) {
		result.push(new Date(time));
	}
	return result;
};
// UI
/**
 * @class UI element of {@link Tasklists}.
 */
function TasklistsUI () {};
/**
 * @param {Tasklists} tasklists
 */
TasklistsUI.load = function (tasklists) {
	$.each(tasklists.items, function (i, tasklist) {
		$('#tasklists').append($('<span/>')
				.attr('value', tasklist.id)
				.text(tasklist.title));
	});
};
/**
 * @class UI element of tags
 */
function TagsUI () {};
/**
 * @param {Tasks} tasks
 */
TagsUI.load = function (tasks) {
	$('#tags').empty();
	$('.tag-bubble').hide();
	$.each(tasks.tags, function (i, tag) {
		$('<span/>').text(tag)
			.mouseenter(function () {
				$('.tag-bubble>.body>.name').text(tag);
				$('.tag-bubble')
					.css('left', $(this).position().left)
					.show()
					.mouseenter(function () {
						$(this).clearQueue();
					})
					.mouseleave(function () {
						$(this).fadeOut();
					});
			}).mouseleave(function () {
				$('.tag-bubble').delay(3000).fadeOut();
			})
			.appendTo($('#tags'));
	});
};
/**
 * @class UI element of {@link Tasks}.
 */
function TasksUI () {};
/**
 * @param {Tasks} tasks
 */
TasksUI.load = function (tasks) {
	$('#calendar').empty().append($('<tbody/>'));
	/**
	 * @param {Date} date
	 */
	$.each(tasks.days(7), function (i, date) {
		$('<tr/>')
			.attr('id', 't' + date.getTime())
			.addClass('w' + date.getDay())
			.addClass('d' + date.getDate())
			.addClass(DateUtil.futureOrPast(date, 'future', 'today', 'past'))
			.append($('<td class="month-column"/>')
					.append($('<div/>').text(date.getMonth() + 1)))
			.append($('<td class="weekday-column"/>')
					.append($.resource('weekday' + date.getDay())))
			.append($('<td class="date-column"/>')
					.append($('<div/>').text(date.getDate())))
			.append($('<td class="task-column"/>'))
			.appendTo($('#calendar>tbody'));
	});
	$.each(tasks.items, function (i, task) {
		new TaskUI(task).appendTo($('#t' + task.dueTime + '>td.task-column'));
	});
	$('.task-column').droppable({
		accept: '.task',
		tolerance: 'pointer',
		hoverClass: 'task-drag-hover',
		activeClass: 'task-drag-active'
	});
	$('.task').draggable({
		revert: true
	});
};
/**
 * @class UI element of task.
 */
function TaskUI (task) {
	this.element = $('<div class="task"/>');
	this.refresh(task);
}
/**
 * Append this element.
 * @param element
 */
TaskUI.prototype.appendTo = function (element) {
	this.element.appendTo(element);
};
/**
 * Refresh view.
 * @param task JSON task
 */
TaskUI.prototype.refresh = function (task) {
	var context = this;
	this.element.empty()
		.addClass('task-status-' + task.status)
		.text(task.title)
		.prepend($('<input class="iscompleted" type="checkbox"/>').change(function () {
			if (this.checked) {
				task.status = 'completed';
			}
			else {
				task.status = 'needsAction';
			}
			Tasks.updateStatus(task, function (response) {
				context.refresh(response);
			});
		}));
	if (task.status == 'completed') {
		$('>.iscompleted', this.element).attr('checked', 'checked');
	}
	$.each(task.tags, function (i, tag) {
		context.element.append($('<div class="task-tag"/>').text(tag));
	});
};
// utility
/**
 * @class DateUtil
 */
function DateUtil () {};
/**
 * @param {Date} date
 * @param future
 * @param today
 * @param past
 * @returns future, today or past
 */
DateUtil.futureOrPast = function (date, future, today, past) {
	var normalizedDate = new Date(date);
	var normalizedToday = new Date();
	normalizedDate.setHours(0, 0, 0, 0);
	normalizedToday.setHours(0, 0, 0, 0);
	if (normalizedDate > normalizedToday) {
		return future;
	}
	else if (normalizedDate < normalizedToday) {
		return past;
	}
	return today;
};
$(function () {
	$.extend({
		resource: function (key) {
			return $('#rc-' + key).clone(true).removeClass('resource').removeAttr('id');
		},
		isDevelopment: function () {
			return location.hostname == 'localhost';
		}
	});
});
// controller
function States () {}
States.authorized = function () {
	Tasklists.get(function (tasklists) {
		TasklistsUI.load(tasklists);
	});
	Tasks.getDefault(function (tasks) {
		TasksUI.load(tasks);
		TagsUI.load(tasks);
	});
};
States.unauthorized = function () {
	// wake up an instance in background
	new Image().src = 'wake';
};
$(function () {
	// global error handler
	var _window_onerror_handling = false;
	window.onerror = function () {
		if (!_window_onerror_handling) {
			_window_onerror_handling = true;
			$('#global-error-message').fadeIn();
		}
	};
	$('#global-error-message').click(function () {
		$(this).fadeOut();
	});
	// ajax error handler
	$(document).ajaxStart(function (event, xhr) {
		$('#loading').fadeIn();
	});
	$(document).ajaxStop(function (event, xhr) {
		$('#loading').fadeOut();
	});
	$(document).ajaxError(function (event, xhr) {
		if (xhr.status == 403) {
			Session.login();
		}
		else {
			$('#global-error-message').fadeIn();
		}
	});
	// development only
	if ($.isDevelopment()) {
		$('.development').hide().show();
	}
	// determine authorization state
	var q = location.hash.match(/^#(s=.*)/);
	if (q) {
		// step2: receive session key via hash
		document.cookie = q[1];
		location.hash = '';
		location.replace(location.pathname);
	}
	else if (document.cookie.match(/^s=|; s=/)) {
		// step3: authorized
		if ($.isFunction(States.authorized)) {
			States.authorized();
		}
		$('a.session-logout').attr('href', 'logout');
		$('.authorized').hide().show();
	}
	else {
		// step1: unauthorized
		if ($.isFunction(States.unauthorized)) {
			States.unauthorized();
		}
		var sslbase = location.protocol + '//' + location.host;
		$('a.session-login').attr('href', 'https://accounts.google.com/o/oauth2/auth?redirect_uri='
				+ (sslbase + location.pathname + 'oauth2')
				+ '&response_type=code&scope=https://www.googleapis.com/auth/tasks&client_id=965159379100.apps.googleusercontent.com');
		$('.unauthorized').hide().show();
	}
});