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
// indicators
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
});
// initialize page
$(function () {
	var vm = new PageViewModel();
	ko.applyBindings(vm);
	// TODO: debug purpose only
	window.taskwalls_page_vm = vm;
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
