/**
 * @class OAuth 2.0 session controller.
 */
function OAuth2Session () {
};
/**
 * Handle current request.
 */
OAuth2Session.prototype.handle = function () {
	var context = this;
	var params = RequestUtil.getQueryParameters();
	if (params['code']) {
		// step2: received authorization code
		this.onAuthorizing();
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
		return;
	}
	if (params['error']) {
		// step2-2: authorization denied
		window.location.replace('/logout');
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
		/**
		 * @param {XMLHttpRequest} xhr
		 */
		$(document).ajaxError(function (event, xhr, settings, e) {
			if (xhr.status == 403) {
				// session expired
				context.authorize();
			}
			else {
				throw e;
			}
		});
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
 * Authorize.
 */
OAuth2Session.prototype.authorize = function () {
	$('#global-error-message').hide();
	window.location.replace(this.getAuthorizationURL());
};
/**
 * Event handler for authorization in progress.
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
