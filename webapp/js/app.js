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
		},
		isDevelopment: function () {
			return location.hostname == 'localhost';
		}
	});
});
// session
/**
 * @class OAuth 2.0 session controller.
 */
function OAuth2Session () {
	this.clientId = '965159379100.apps.googleusercontent.com';
};
/**
 * Get the access token in current session.
 * @returns {String} access token
 */
OAuth2Session.getAccessToken = function () {
	return localStorage.getItem('accessToken');
};
/**
 * Handle current request.
 */
OAuth2Session.prototype.handle = function () {
	var context = this;
	// determine authorization state
	var accessTokenMatch = location.hash.match(/access_token=([^&=]+)/);
	if (accessTokenMatch) {
		// step2: received access token
		this.onAuthorizing();
		// validate the token
		var accessToken = accessTokenMatch[1];
		$.ajax({
			url: 'https://www.googleapis.com/oauth2/v1/tokeninfo',
			data: {
				access_token: accessToken
			},
			dataType: 'jsonp',
			success: function (tokeninfo) {
				if (context.clientId == tokeninfo.audience) {
					localStorage.setItem('accessToken', accessToken);
					location.replace(location.pathname);
				}
				else {
					// validation error
					location.replace(location.pathname);
				}
			}
		});
		return;
	}
	var authorizationErrorMatch = location.hash.match(/error=/);
	if (authorizationErrorMatch) {
		// step2-1: authorization error
		location.replace(location.pathname);
		return;
	}
	if (OAuth2Session.getAccessToken()) {
		// step3: authorized
		this.onAuthorized();
		return;
	}
	else {
		// step1: unauthorized
		this.onUnauthorized();
		return;
	}
};
/**
 * Get the login URL.
 * @returns {String} URL
 */
OAuth2Session.prototype.getLoginURL = function () {
	return 'https://accounts.google.com/o/oauth2/auth'
		+ '?redirect_uri=' + (location.protocol + '//' + location.host + location.pathname)
		+ '&response_type=token'
		+ '&scope=https://www.googleapis.com/auth/tasks'
		+ '&client_id=' + this.clientId;
};
/**
 * Log out the session.
 */
OAuth2Session.prototype.logout = function () {
	localStorage.removeItem('accessToken');
	location.replace(location.pathname);
};
/**
 * Authorization in progress.
 */
OAuth2Session.prototype.onAuthorizing = function () {
};
/**
 * On authorized.
 */
OAuth2Session.prototype.onAuthorized = function () {
	new UIPage();
	$('.authorized').hide().show();
};
/**
 * Unauthorized.
 */
OAuth2Session.prototype.onUnauthorized = function () {
	$('a.session-login').button();
	$('.unauthorized').hide().show();
};
// controller
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
	// check capability
	if (localStorage == undefined) {
		// TODO: sorry page
		return;
	}
	// OAuth session
	var session = new OAuth2Session();
	session.handle();
	$('a.session-login').attr('href', session.getLoginURL());
	$('a.session-logout').click(function () {
		session.logout();
		return false;
	});
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





