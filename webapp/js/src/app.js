/*
 * app.js
 * (c) hidetake.org, 2011.
 */
// libs
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
	if (window.location.hostname == 'localhost') {
		$('.development').hide().show();
	}
	// offline
	if (sessionStorage['session-offline']) {
		$('#session-offline').attr('checked', 'checked');
	}
	$('#session-offline').change(function () {
		AppSettings.setOffline(this.checked);
	});
});
// data binding
$(function () {
	var PageViewModel = function () {
		var self = this;
		this.oauth2authorized = ko.observable(false);
		this.oauth2authorizing = ko.observable(false);
		this.oauth2unauthorized = ko.observable(false);
		this.oauth2authorizationURL = ko.observable();
		// handle OAuth2 session
		new OAuth2Session(function () {
			this.onAuthorized = function () {
				self.oauth2authorized(true);
				new UIPage();
			};
			this.onAuthorizing = function () {
				self.oauth2authorizing(true);
				// clean up cache
				localStorage.clear();
			};
			this.onUnauthorized = function () {
				self.oauth2unauthorized(true);
				self.oauth2authorizationURL(this.getAuthorizationURL());
			};
		}).handle();
	};
	ko.applyBindings(new PageViewModel());
});
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
