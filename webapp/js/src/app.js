/*
 * app.js
 * (c) hidetake.org, 2011.
 */
// libs
// extensions
$(function () {
	$.extend({
		/**
		 * Get resource from document.
		 * @param {String} key
		 * @returns {String}
		 */
		resource: function (key) {
			return $('#resources>[data-key="' + key + '"]').text();
		}
	});
});
$(function () {
	// global error handler
	var _window_onerror_handling = false;
	window.onerror = function () {
		if (!_window_onerror_handling) {
			_window_onerror_handling = true;
			$('#loading').hide();
			$('#global-errors').fadeIn();
		}
		_window_onerror_handling = false;
	};
	$('#global-errors').click(function () {
		$(this).fadeOut();
	});
	// ajax handler
	$(document).ajaxStart(function (event, xhr) {
		$('#global-errors').fadeOut();
		$('#loading').fadeIn();
	});
	$(document).ajaxStop(function (event, xhr) {
		$('#loading').fadeOut();
	});
	$('#loading').hide();
	// initialize
	new OAuth2Session(function () {
		this.onAuthorized = function () {
			$('.oauth2state>:not(.authorized)').remove();
			$('.oauth2state').show();
			ko.applyBindings(window.taskwallsPageVM = new AuthorizedPageViewModel());
		};
		this.onAuthorizing = function () {
			$('.oauth2state>:not(.authorizing)').remove();
			$('.oauth2state').show();
			// clean up cache
			localStorage.clear();
		};
		this.onUnauthorized = function () {
			$('.oauth2state>:not(.unauthorized)').remove();
			$('.oauth2state').show();
			// TODO: need to bind?
			$('.session-login').attr('href', this.getAuthorizationURL());
		};
	}).handle();
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
