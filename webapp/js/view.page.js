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
				$('.tasklist-' + tasklist.id)
					.addClass('tasklistcolor-' + tasklists.getByID(tasklist.id).colorID);
			}
			else {
				context.tasklists.add(new UITasklist(tasklist, false));
				Tasks.get(tasklist.id, function (tasks) {
					context.calendar.add(tasks);
				});
			}
		});
	}
};