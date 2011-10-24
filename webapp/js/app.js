/*
 * app.js
 * (c) hidetake.org, 2011.
 */
document.write('<script type="text/javascript" src="/js/util.js"></script>');
document.write('<script type="text/javascript" src="/js/model.js"></script>');
document.write('<script type="text/javascript" src="/js/view.js"></script>');
// extensions
$(function () {
	$.extend({
		resource: function (key) {
			return $('#' + key).clone().removeClass('resource').removeAttr('id');
		},
		isDevelopment: function () {
			return location.hostname == 'localhost';
		}
	});
});
// controller
function States () {}
States.authorized = function () {
	// header
	new UIHeader();
	// get tasklists
	Tasklists.get(function (tasklists) {
		var uiTasklists = new UITasklists();
		uiTasklists.add(tasklists);
		var uiCalendar = new UICalendar(tasklists);
		$.each(tasklists.items, function (i, tasklist) {
			Tasks.get(tasklist.id, function (tasks) {
				uiCalendar.add(tasks);
			});
		});
	});
};
States.authorizing = function () {
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
			$('#loading').hide();
			$('#global-error-message').fadeIn();
		}
	};
	$('#global-error-message').click(function () {
		$(this).fadeOut();
	});
	// ajax error handler
	$('#loading').show().hide();
	$(document).ajaxStart(function (event, xhr) {
		$('#global-error-message').fadeOut();
		$('#loading').fadeIn();
	});
	$(document).ajaxStop(function (event, xhr) {
		$('#loading').fadeOut();
	});
	/** @param {XMLHttpRequest} xhr */
	$(document).ajaxError(function (event, xhr) {
		if (xhr.status == 403) {
			location.replace($('a.session-login').attr('href'));
		}
		else {
			$('#global-error-message').fadeIn();
		}
	});
	// development only
	if ($.isDevelopment()) {
		$('.development').hide().show();
	}
	// URIs
	$('a.session-logout').attr('href', 'logout');
	$('a.session-login').attr('href', 'https://accounts.google.com/o/oauth2/auth?redirect_uri='
		+ (location.protocol + '//' + location.host + location.pathname)
		+ '&response_type=code&scope=https://www.googleapis.com/auth/tasks'
		+ '&client_id=965159379100.apps.googleusercontent.com');
	// determine authorization state
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
	else if (document.cookie.match(/^s=|; s=/)) {
		// step3: authorized
		if ($.isFunction(States.authorized)) {
			States.authorized();
		}
		$('.authorized').hide().show();
	}
	else {
		// step1: unauthorized
		if ($.isFunction(States.unauthorized)) {
			States.unauthorized();
		}
		$('.unauthorized').hide().show();
	}
});
/**
 * @class constants
 */
var Constants = {
	tasklistColors: 4,
	/**
	 * Generates array of color IDs.
	 * @returns {Array} array of number
	 */
	tasklistColorIDs: function () {
		var IDs = [];
		for (var colorID = 0; colorID < this.tasklistColors; colorID++) {
			IDs.push(colorID);
		}
		return IDs;
	}
};





