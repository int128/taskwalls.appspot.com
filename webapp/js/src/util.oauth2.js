/**
 * OAuth 2.0 session controller.
 */
function OAuth2Controller () {};
OAuth2Controller.prototype = {};
/**
 * Get the authorization URL.
 * @returns {String} URL
 */
OAuth2Controller.getAuthorizationURL = function () {
	return 'https://accounts.google.com/o/oauth2/auth'
		+ '?redirect_uri=' + (location.protocol + '//' + location.host + location.pathname)
		+ '&response_type=code'
		+ '&scope=https://www.googleapis.com/auth/tasks'
		+ '&access_type=offline'
		+ '&approval_prompt=force'
		+ '&client_id=965159379100.apps.googleusercontent.com';
};
/**
 * Log out the session.
 * Clean up the local cache.
 */
OAuth2Controller.logout = function () {
	localStorage.clear();
	sessionStorage.clear();
	location.replace('/');
};
/**
 * Handle the request.
 * @param {Object} events map of event handlers
 */
OAuth2Controller.handle = function (events) {
	function _ (func) {
		return $.isFunction(func) ? func : $.noop;
	};

	var params = $.queryParameters();
	if (params['code']) {
		_(events.processingAuthorizationCode)();
		this.processAuthorizationCode(params['code']);
	}
	else if (params['error']) {
		this.logout();
	}
	else if (localStorage['session']) {
		this.setUpAjaxSession(localStorage['session']);
		_(events.alreadyAuthorized)();
	}
	else {
		_(events.notAuthorizedYet)();
	}
};
OAuth2Controller.processAuthorizationCode = function (code) {
	localStorage.clear();
	sessionStorage.clear();
	$.post('/oauth2', {code: code})
		.done(function (data, status, xhr) {
			localStorage['session'] = xhr.getResponseHeader('X-TaskWall-Session');
			location.replace(location.pathname);
		})
		.fail(function (error) {
			OAuth2Controller.logout();
		});
};
OAuth2Controller.setUpAjaxSession = function (sessionId) {
	$(document).ajaxSend(function (event, xhr) {
		xhr.setRequestHeader('X-TaskWall-Session', sessionId);
	});
	$(document).ajaxError(function (event, xhr) {
		if (xhr.status == 403) {
			// session has been expired
			location.replace(OAuth2Controller.getAuthorizationURL());
		}
	});
};
