var PageViewModel = function () {
	var self = this;

	// calendar
	this.calendar = new CalendarViewModel();

	// tasks
	this.tasklists = ko.observableArray();
	this.loadTasks = function () {
		var defaultTasklistID = null;
		var tasklistsLoaded = false;
		var loadAllTasklists = function () {
			if (defaultTasklistID && tasklistsLoaded) {
				$.each(self.tasklists(), function (i, tasklist) {
					if (tasklist.id() != defaultTasklistID) {
						Tasks.get(tasklist.id(), function (tasks) {
							// FIXME: infinite loop?
//							self.calendar.addTasks($.map(tasks, function (task) {
//								return new TaskViewModel(task);
//							}));
						});
					}
				});
			}
		};
		Tasks.get('@default', function (tasks) {
			if (tasks.length > 0) {
				self.calendar.addTasks($.map(tasks, function (task) {
					return new TaskViewModel(task);
				}));
				// extract tasklist ID from URL
				var p = new String(tasks[0].selfLink).split('/');
				defaultTasklistID = p[p.length - 3];
				loadAllTasklists();
			}
		});
		Tasklists.get(function (tasklists) {
			if (tasklists.length > 0) {
				self.tasklists($.map(tasklists, function (tasklist) {
					return new TasklistViewModel(tasklist);
				}));
				tasklistsLoaded = true;
				loadAllTasklists();
			}
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


// FIXME: remove below
/**
 * @class the page
 */
function UIPage () {
	this.header = new UIHeader(this);
	this.tasklists = new UITasklists(this);
	this.calendar = new UICalendar(this);
	this.refresh();
}
/**
 * Refresh the page.
 */
UIPage.prototype.refresh = function () {
	var context = this;
	var defaultTasklistID = undefined;
	var loadedTasklists = undefined;
	this.calendar.clear();
	/**
	 * Load tasks of the default tasklist.
	 * @param {Tasks} tasks
	 */
	Tasks.get('@default', function (tasks) {
		if (tasks.items.length > 0) {
			defaultTasklistID = tasks.items[0].tasklistID;
		}
		else {
			defaultTasklistID = '@default';
		}
		context.calendar.add(tasks);
		context.loadOtherTasks(loadedTasklists, defaultTasklistID);
	});
	/**
	 * Load tasklists.
	 * @param {Tasklists} tasklists
	 */
	Tasklists.get(function (tasklists) {
		loadedTasklists = tasklists;
		context.calendar.setTasklists(tasklists);
		context.tasklists.clear();
		context.loadOtherTasks(loadedTasklists, defaultTasklistID);
	});
	// calendar tab
	$('a[href="#clear-completed-tasks"]').click(function () {
		/**
		 * @param {UITasklist} uiTasklist
		 */
		$.each(context.tasklists.getItems(), function (i, uiTasklist) {
			var elements = uiTasklist.getCompletedTasks();
			elements.addClass('ajax-in-progress');
			uiTasklist.getTasklist().clearCompleted(function () {
				elements.remove();
			}, function () {
				elements.removeClass('ajax-in-progress');
			});
		});
		return false;
	});
};
/**
 * Load tasks except tasks of the default tasklist.
 * @param {Tasklists} tasklists
 * @param {String} defaultTasklistID
 */
UIPage.prototype.loadOtherTasks = function (tasklists, defaultTasklistID) {
	var context = this;
	if (defaultTasklistID && tasklists) {
		$.each(tasklists.items, function (i, tasklist) {
			if (tasklist.id == defaultTasklistID) {
				context.tasklists.add(new UITasklist(tasklist, true));
				$('.task-tasklistID-' + tasklist.id)
					.addClass('tasklistcolor-' + tasklists.getByID(tasklist.id).colorID);
			}
			else {
				var uiTasklist = new UITasklist(tasklist, false);
				context.tasklists.add(uiTasklist);
				uiTasklist.enterAjax();
				Tasks.get(tasklist.id, function (tasks) {
					context.calendar.add(tasks);
					uiTasklist.leaveAjax();
				});
			}
		});
	}
};