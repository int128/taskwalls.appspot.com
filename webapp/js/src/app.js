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
});
// data binding
$(function () {
	var PageViewModel = function () {
		var self = this;

		// calendar
		this.calendar = new CalendarViewModel();

		// tasks
		this.tasklists = ko.observableArray();
		this.defaultTasklistID = ko.observable('@default');
		this.loadTasks = function () {
			Tasks.get('@default', function (tasks) {
				if (tasks.items.length > 0) {
					self.defaultTasklistID(tasks.items[0].tasklistID);
				}
			});
			Tasklists.get(function (tasklists) {
				self.tasklists(tasklists.items);
			});
		};

		// offline
		this.offline = ko.computed({
			read: function () {
				return AppSettings.isOffline();
			},
			write: function (value) {
				AppSettings.setOffline(value);
			}
		});
		this.lastCached = ko.observable(AppSettings.getCachedDate('Tasklists.get'));

		// handle OAuth2 session
		this.oauth2authorized = ko.observable(false);
		this.oauth2authorizing = ko.observable(false);
		this.oauth2unauthorized = ko.observable(false);
		this.oauth2authorizationURL = ko.observable();
		new OAuth2Session(function () {
			this.onAuthorized = function () {
				self.oauth2authorized(true);
				self.loadTasks();
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
