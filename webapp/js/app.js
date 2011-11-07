/*
 * app.js
 * (c) hidetake.org, 2011.
 */
// libs
document.write('<script type="text/javascript" src="/js/lib/jquery.cookie.js"></script>');
// modules
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
	// user page
	new UIPage();
};
States.authorizing = function () {
};
States.unauthorized = function () {
	// welcome page
	$('a.session-login').button();
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
			$('#global-error-message').remove();
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
	var authorizationCodeMatch = location.search.match(/\?code=(.*)/);
	if (authorizationCodeMatch) {
		// step2: received authorization code
		if ($.isFunction(States.authorizing)) {
			States.authorizing();
		}
		$.post('oauth2', {code: authorizationCodeMatch[1]}, function () {
			location.replace(location.pathname);
		});
		return;
	}
	if (location.search == '?error=access_denied') {
		location.replace(location.pathname);
		return;
	}
	if ($.cookie('s')) {
		// step3: authorized
		/**
		 * Add token to request header.
		 * @param {XMLHttpRequest} xhr
		 */
		$(document).ajaxSend(function (event, xhr) {
			xhr.setRequestHeader('X-TaskWall-Session', $.cookie('s'));
		});
		if ($.isFunction(States.authorized)) {
			States.authorized();
		}
		$('.authorized').hide().show();
		return;
	}
	else {
		// step1: unauthorized
		if ($.isFunction(States.unauthorized)) {
			States.unauthorized();
		}
		$('.unauthorized').hide().show();
		return;
	}
});
/**
 * @class constants
 */
var Constants = {
	tasklistColors: 24,
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





