/**
 * @class PageViewModel
 */
var PageViewModel = function() {
	var self = this;

	// tasks
	this.taskdata = new TaskdataViewModel();
	this.completedCount = ko.computed(function () {
		return $.grep(this.taskdata.tasks(), function (task) {
			return DateUtil.isThisWeek(task.due()) && task.completed();
		}).length;
	}, this);
	this.needsActionCount = ko.computed(function () {
		return $.grep(this.taskdata.tasks(), function (task) {
			return DateUtil.isThisWeek(task.due()) && !task.completed();
		}).length;
	}, this);

	// calendar
	this.calendar = new CalendarViewModel(this.taskdata);

	this.createTask = function () {
		// TODO: open dialog
	};

	// offline
	this.offline = ko.computed({
		read : function() {
			return AppSettings.isOffline();
		},
		write : function(value) {
			AppSettings.setOffline(value);
		}
	});
	this.lastCached = ko.observable(AppSettings.getCachedDate('Tasklists.get'));

	// handle OAuth2 session
	this.oauth2authorized = ko.observable(false);
	this.oauth2authorizing = ko.observable(false);
	this.oauth2unauthorized = ko.observable(false);
	this.oauth2authorizationURL = ko.observable();
	new OAuth2Session(function() {
		this.onAuthorized = function() {
			self.oauth2authorized(true);
			self.taskdata.load();
		};
		this.onAuthorizing = function() {
			self.oauth2authorizing(true);
			// clean up cache
			localStorage.clear();
		};
		this.onUnauthorized = function() {
			self.oauth2unauthorized(true);
			self.oauth2authorizationURL(this.getAuthorizationURL());
		};
	}).handle();
};