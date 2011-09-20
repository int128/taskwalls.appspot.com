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
	$.getJSON('tasklists/list', null, function (response) {
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
 * @property {String} tasklistID task list ID
 * @property {Array} items
 */
function Tasks (tasklistID, items) {
	this.tasklistID = tasklistID;
	this.items = items;
};
/**
 * Get tasks from server.
 * @param {String} tasklistID task list ID
 * @param {Function} callback async callback function
 */
Tasks.get = function (tasklistID, callback) {
	$.getJSON('tasks/list', {tasklistID: tasklistID}, function (response) {
		var instance = new Tasks(tasklistID, response.items);
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
 * @returns latest date time in milliseconds
 */
Tasks.prototype.latestTime = function () {
	if (this.items.length == 0) {
		return new Date().getTime();
	}
	return Math.max.apply(null, $.map(this.items, function (task) {
		return task.dueTime;
	}));
};
/**
 * @returns earliest date time in milliseconds
 */
Tasks.prototype.earliestTime = function () {
	if (this.items.length == 0) {
		return new Date().getTime();
	}
	return Math.min.apply(null, $.map(this.items, function (task) {
		return task.dueTime;
	}));
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
TasklistsUI.prototype.load = function (tasklists) {
	$('#tasklists').empty();
	$('.tasklist-bubble').hide();
	$.each(tasklists.items, function (i, tasklist) {
		$('#tasklists').append(new TasklistUIElement(tasklist).element);
	});
};
/**
 * UI element of the tasklist.
 * @param tasklist JSON tasklist
 * @returns {TasklistUIElement}
 */
function TasklistUIElement (tasklist) {
	this.refresh(tasklist);
};
TasklistUIElement.prototype.refresh = function (tasklist) {
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
				context.changeColorTo(this);
				// TODO: change color of tasks
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
 * Change color of this element same to the specified element.
 * @param {Element} reference element which has class .tasklistcolor-*
 */
TasklistUIElement.prototype.changeColorTo = function (reference) {
	for (var i = 0; i < Constants.tasklistColors; i++) {
		if ($(reference).hasClass('tasklistcolor-' + i)) {
			this.element.addClass('tasklistcolor-' + i);
		}
		else {
			this.element.removeClass('tasklistcolor-' + i);
		}
	}
};
/**
 * @class UI element of {@link Tasks}.
 */
function TasksUI () {
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
 * @param {Tasks} tasks
 */
TasksUI.prototype.load = function (tasks) {
	this.extendMonth(tasks.earliestTime());
	this.extendMonth(tasks.latestTime());
	$.each(tasks.items, function (i, task) {
		var date = new Date(task.dueTime);
		date.setHours(0, 0, 0, 0);
		$('#t' + date.getTime() + '>td.task-column').append(new TaskUIElement(task).element);
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
 * Extend rows of the calendar.
 * @param {Number} time date to extend
 */
TasksUI.prototype.extend = function (time) {
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
TasksUI.prototype.extendMonth = function (time) {
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
TasksUI.prototype.createDateRow = function (date) {
	return $('<tr/>')
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
		.append($('<td class="task-column"/>'));
};
/**
 * 
 * @param tasklist
 */
TasksUI.prototype.applyColor = function (tasklist) {
	$('.tasklist-' + tasklist.id).addClass('tasklistcolor-' + tasklist.colorID);
};
/**
 * @class UI element of task.
 * @param task JSON task
 */
function TaskUIElement (task) {
	this.element = $('<div class="task"/>');
	this.refresh(task);
}
/**
 * Refresh view.
 * @param task JSON task
 */
TaskUIElement.prototype.refresh = function (task) {
	var context = this;
	this.element.empty()
		.addClass('task-status-' + task.status)
		.addClass('tasklist-' + task.tasklistID)
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
};
// controller
function States () {}
States.authorized = function () {
	var tasklistsUI = new TasklistsUI();
	var tasksUI = new TasksUI();
	// get tasks of the default tasklist
	Tasks.get('@default', function (tasks) {
		var defaultTasklistID = null;
		if (tasks.items.length > 1) {
			defaultTasklistID = tasks.items[0].tasklistID;
		}
		// get tasklists
		Tasklists.get(function (tasklists) {
			$.each(tasklists.items, function (i, tasklist) {
				if (tasklist.colorID == undefined) {
					tasklist.colorID = i % Constants.tasklistColors;
				}
				if (tasklist.id == defaultTasklistID) {
					tasksUI.applyColor(tasklist);
				}
				else {
					Tasks.get(tasklist.id, function (tasks) {
						tasksUI.load(tasks, tasklist);
						tasksUI.applyColor(tasklist);
					});
				}
			});
			tasklistsUI.load(tasklists);
		});
		tasksUI.load(tasks);
	});
};
States.authorizing = function () {
};
States.unauthorized = function () {
	// wake up an instance in background
	new Image().src = 'wake';
};
// utility
var Constants = {};
Constants.tasklistColors = 4;
/**
 * @class DateUtil
 */
var DateUtil = {};
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
	if (document.cookie.match(/^s=|; s=/)) {
		// step3: authorized
		if ($.isFunction(States.authorized)) {
			States.authorized();
		}
		$('a.session-logout').attr('href', 'logout');
		$('.authorized').hide().show();
	}
	else {
		var q = location.search.match(/\?code=(.*)/);
		if (q) {
			// step2: received authorization code
			if ($.isFunction(States.authorizing)) {
				States.authorizing();
			}
			$.post('oauth2', {code: q[1]}, function () {
				location.replace(location.pathname);
			});
		}
		else if (location.search == '?error=access_denied') {
			location.replace(location.pathname);
		}
		else {
			// step1: unauthorized
			if ($.isFunction(States.unauthorized)) {
				States.unauthorized();
			}
			$('a.session-login').attr('href', 'https://accounts.google.com/o/oauth2/auth?redirect_uri='
					+ (location.protocol + '//' + location.host + location.pathname)
					+ '&response_type=code&scope=https://www.googleapis.com/auth/tasks&client_id=965159379100.apps.googleusercontent.com');
			$('.unauthorized').hide().show();
		}
	}
});