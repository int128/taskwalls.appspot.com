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
	// offline status
	if (AppSettings.isOffline()) {
		var cached = AppSettings.getCachedDate('Tasklists.get');
		$('#calendar-cached-date>.month').text(cached.getMonth() + 1);
		$('#calendar-cached-date>.day').text(cached.getDate());
		$('#calendar-cached-date>.hour').text(cached.getHours());
		$('#calendar-cached-date>.minute').text(cached.getMinutes());
		$('#calendar-cached-date').show();
	}
	else {
		$('#calendar-cached-date').hide();
	}
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