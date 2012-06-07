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
	var params = RequestUtil.getQueryParameters();
	if (params['code']) {
		// step2: received authorization code
		if (this.onAuthorizing() !== false) {
			$.ajax({
				url: '/oauth2',
				type: 'POST',
				data: {
					code: params['code']
				},
				success: function () {
					window.location.replace(window.location.pathname);
				},
				error: function () {
					// step2-1: authorization error
					window.location.replace('/logout');
				}
			});
		}
	}
	else if (params['error']) {
		// step2-2: authorization denied
		window.location.replace('/logout');
	}
	else if ($.cookie('s')) {
		// step3: authorized
		/**
		 * Add token to request header.
		 * @param {XMLHttpRequest} xhr
		 */
		$(document).ajaxSend(function (event, xhr) {
			xhr.setRequestHeader('X-TaskWall-Session', $.cookie('s'));
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
