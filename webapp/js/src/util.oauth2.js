/**
 * @class OAuth 2.0 session controller.
 */
function OAuth2Session () {
};
/**
 * Handle current request.
 */
OAuth2Session.prototype.handle = function () {
	var self = this;
	var params = $.queryParameters();
	if (params['code']) {
		// step2: received authorization code
		localStorage.clear();
		sessionStorage.clear();
		if (this.onAuthorizing() !== false) {
			$.post('/oauth2', {code: params['code']})
				/**
				 * @param {XMLHttpRequest} xhr
				 */
				.done(function (data, status, xhr) {
					localStorage['session'] = xhr.getResponseHeader('X-TaskWall-Session');
					window.location.replace(window.location.pathname);
				})
				.fail(function () {
					// step2-1: authorization error
					self.logout();
				});
		}
	}
	else if (params['error']) {
		// step2-2: authorization denied
		self.logout();
	}
	else if (localStorage['session']) {
		// step3: authorized
		/**
		 * Add token to request header.
		 * @param {XMLHttpRequest} xhr
		 */
		$(document).ajaxSend(function (event, xhr) {
			xhr.setRequestHeader('X-TaskWall-Session', localStorage['session']);
		});
		/**
		 * @param {XMLHttpRequest} xhr
		 */
		$(document).ajaxError(function (event, xhr, settings, e) {
			if (xhr.status == 403) {
				// session has been expired
				$('#global-errors').hide();
				window.location.replace(self.getAuthorizationURL());
			}
			else {
				throw e;
			}
		});
		this.onAuthorized();
	}
	else {
		// step1: unauthorized
		this.onUnauthorized();
	}
};
/**
 * Get the authorization URL.
 * @returns {String} URL
 */
OAuth2Session.prototype.getAuthorizationURL = function () {
	return 'https://accounts.google.com/o/oauth2/auth'
		+ '?redirect_uri=' + (window.location.protocol + '//' + window.location.host + window.location.pathname)
		+ '&response_type=code'
		+ '&scope=https://www.googleapis.com/auth/tasks'
		+ '&access_type=offline'
		+ '&approval_prompt=force'
		+ '&client_id=965159379100.apps.googleusercontent.com';
};
/**
 * Log out the session.
 * Clean up the local cache and server session.
 */
OAuth2Session.prototype.logout = function () {
	localStorage.clear();
	sessionStorage.clear();
	$.get('/logout').done(function () {
		window.location.replace('/');
	});
};
/**
 * Event handler for authorization in progress.
 * @returns {Boolean} false if do not continue
 */
OAuth2Session.prototype.onAuthorizing = function () {};
/**
 * Event handler on authorized.
 */
OAuth2Session.prototype.onAuthorized = function () {};
/**
 * Event handler for unauthorized.
 */
OAuth2Session.prototype.onUnauthorized = function () {};
