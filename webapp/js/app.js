/*
 * app.js
 * (c) hidetake.org, 2011.
 */
// libs
document.write('<script type="text/javascript" src="/js/lib/jquery.cookie.js"></script>');
// modules
document.write('<script type="text/javascript" src="/js/util.js"></script>');
document.write('<script type="text/javascript" src="/js/model.js"></script>');
document.write('<script type="text/javascript" src="/js/view.page.js"></script>');
document.write('<script type="text/javascript" src="/js/view.calendar.js"></script>');
document.write('<script type="text/javascript" src="/js/view.header.js"></script>');
// extensions
$(function () {
	$.extend({
		resource: function (key) {
			return $('#' + key).clone().removeClass('resource').removeAttr('id');
		}
	});
});
// front controller
$(function () {
	// global error handler
	var _window_onerror_handling = false;
	window.onerror = function () {
		if (!_window_onerror_handling) {
			_window_onerror_handling = true;
			$('#loading').hide();
			$('#global-error-message').fadeIn();
		}
		_window_onerror_handling = false;
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
	// development only
	if (location.hostname == 'localhost') {
		$('.development').hide().show();
	}
	// offline
	if (sessionStorage['session-offline']) {
		$('#session-offline').attr('checked', 'checked');
	}
	$('#session-offline').change(function () {
		AppSettings.setOffline(this.checked);
	});
	// start session
	currentOAuth2Session = new OAuth2Session();
	currentOAuth2Session.onAuthorized = function () {
		new UIPage();
		$('a.session-logout').attr('href', '/logout');
		$('.authorized').hide().show();
	};
	currentOAuth2Session.onAuthorizing = function () {
		// clean up cache
		localStorage.clear();
		$('.authorizing').hide().show();
	};
	currentOAuth2Session.onUnauthorized = function () {
		$('a.session-login').attr('href', currentOAuth2Session.getAuthorizationURL());
		$('.unauthorized').hide().show();
	};
	currentOAuth2Session.handle();
});
/**
 * @type OAuth2Session
 */
var currentOAuth2Session;
/**
 * Application settings.
 */
function AppSettings () {
};
AppSettings.tasklistColors = 24;
/**
 * Generates array of color IDs.
 * @returns {Array} array of number
 */
AppSettings.tasklistColorIDs = function () {
	var IDs = [];
	for (var colorID = 0; colorID < this.tasklistColors; colorID++) {
		IDs.push(colorID);
	}
	return IDs;
};
/**
 * Is offline mode?
 * @returns {Boolean}
 */
AppSettings.isOffline = function () {
	return sessionStorage['session-offline'] == 'true';
};
/**
 * Set offline mode.
 * @param {Boolean} enabled
 */
AppSettings.setOffline = function (enabled) {
	if (enabled) {
		sessionStorage['session-offline'] = true;
	}
	else {
		sessionStorage.removeItem('session-offline');
	}
};
/**
 * Set last cached date.
 * @param {String} key
 * @param {Date} date
 */
AppSettings.setCachedDate = function (key, date) {
	localStorage[key + '#cached'] = date.getTime();
};
/**
 * Get last cached date.
 * @param {String} key
 * @returns {Date}
 */
AppSettings.getCachedDate = function (key) {
	return new Date(parseInt(localStorage[key + '#cached']));
};
