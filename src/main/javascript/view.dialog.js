/**
 * Provides life cycle management of dialogs.
 * 
 * <p>Define a view model:</p>
 * <code><pre>
 * function PageViewModel () {
 *   var factory = function (arg1, viewModel, event) {
 *     return new SomeDialog();
 *   };
 *   this.dm = DialogManager(factory, arg1);
 * }
 * </pre></code>
 * and bind it:
 * <code><pre>
 * &lt;!-- ko foreach: dm --&gt;
 * &lt;div data-bind="visible: visible, escKeydown: close" --&gt;
 *   &lt;div class="dialog"&gt;
 *     dialog template here
 *   &lt;/div&gt;
 *   &lt;div data-bind="click: close" class="dialog-background"&gt;&lt;/div&gt;
 * &lt;/div&gt;
 * &lt;!-- /ko &gt;
 * </pre></code>
 * 
 * <p>Open an new dialog:</p>
 * <code><pre>
 * &lt;button data-bind="click: dm.open"&gt;open&lt;/button&gt;
 * </pre></code>
 * 
 * <p>Close the dialog:</p>
 * <code><pre>
 * &lt;!-- ko foreach: dm --&gt;
 * &lt;div data-bind="visible: visible, escKeydown: close" --&gt;
 *   &lt;div class="dialog"&gt;
 *     &lt;button data-bind="click: close"&gt;&amp;times;&lt;/button&gt;
 *     dialog template here
 *   &lt;/div&gt;
 *   &lt;div data-bind="click: close" class="dialog-background"&gt;&lt;/div&gt;
 * &lt;/div&gt;
 * &lt;!-- /ko &gt;
 * </pre></code>
 * 
 * <p>Transactional operation:</p>
 * <code><pre>
 * function SomeDialog () {
 *   this.save = function () {
 *     this.transaction($.post('/save', data)));
 *     // The dialog close immediately.
 *     // If request has been success, the dialog will be closed.
 *     // If request has been failed, the dialog will be appeared again.
 *   };
 * }
 * </pre></code>
 * 
 * @param {Function}
 *            factoryFunction
 * @param {Object}
 *            factoryArgs arguments for factoryFunction
 * @returns observable array instance
 */
function DialogManager (factoryFunction, factoryArgs) {
	var factoryArguments = Array.prototype.slice.call(arguments, 1);
	var observableArray = ko.observableArray();
	observableArray.open = function () {
		var dialog = factoryFunction.apply(null,
				factoryArguments.concat(Array.prototype.slice.call(arguments)));
		dialog.visible = ko.observable(true);
		dialog.show = function () {
			dialog.visible(true);
		};
		dialog.hide = function () {
			dialog.visible(false);
		};
		dialog.close = function () {
			observableArray.remove(dialog);
		};
		dialog.dialogTransaction = function (deferred) {
			dialog.hide();
			deferred.done(function () {
				dialog.close();
			}).fail(function () {
				dialog.show();
			});
		};
		observableArray.push(dialog);
	};
	return observableArray;
};

/**
 * @class Dialog to create a task.
 */
function CreateTaskDialog () {
	this.initialize.apply(this, arguments);
};

CreateTaskDialog.factory = function (taskdata, rowViewModel, event) {
	return new CreateTaskDialog(taskdata, rowViewModel.getDayForNewTask());
};

/**
 * @param {Taskdata}
 *            taskdata
 * @param {Date}
 *            due
 */
CreateTaskDialog.prototype.initialize = function (taskdata, due) {
	this.due = ko.observable(due);
	this.title = ko.observable();
	this.notes = ko.observable();
	this.repeat = ko.observable();

	this.titleFocus = ko.observable(true);
	this.tasklists = taskdata.tasklists();
	this.selectedTasklist = ko.observable(this.tasklists[0]); // select first item
	this.selectTasklist = function (tasklist) {
		this.selectedTasklist(tasklist);
		this.titleFocus(true);
	}.bind(this);

	this.validate = function () {
		return this.title();
	}.bind(this);
	this.save = function () {
		if (this.validate()) {
			this.dialogTransaction(
					TaskService.create(taskdata, {
						tasklistID: this.selectedTasklist().id(),
						due: this.due(),
						title: this.title(),
						notes: this.notes()
					}));
		}
	}.bind(this);
};

/**
 * @class Dialog to update the task.
 */
function UpdateTaskDialog () {
	this.initialize.apply(this, arguments);
};

UpdateTaskDialog.factory = function (taskdata, taskViewModel, event) {
	return new UpdateTaskDialog(taskdata, taskViewModel);
};

/**
 * @param {Taskdata}
 *            taskdata
 * @param {Task}
 *            task
 */
UpdateTaskDialog.prototype.initialize = function (taskdata, task) {
	this.task = task;

	this.completed = this.task.completed();
	this.isCompleted = this.task.isCompleted();
	this.saveStatus = function (status) {
		this.dialogTransaction(
				TaskService.update(this.task, {
					status: status
				}));
	};
	this.saveStatusAs = function (status) {
		return this.saveStatus.bind(this, status);
	}.bind(this);

	this.due = ko.observable(this.task.due());
	this.title = ko.observable(this.task.title());
	this.notes = ko.observable(this.task.notes());
	this.repeat = ko.observable(this.task.repeat());
	this.save = function () {
		if (this.title()) {
			this.dialogTransaction(
					TaskService.update(this.task, {
						due: this.due(),
						title: this.title(),
						notes: this.notes(),
						repeat: this.repeat()
					}));
		}
	}.bind(this);

	this.tasklists = taskdata.tasklists();
	this.selectedTasklist = ko.observable(this.task.tasklist());
	this.originalTasklist = ko.observable(this.task.tasklist());
	this.selectTasklist = function (tasklist) {
		this.selectedTasklist(tasklist);
	}.bind(this);
	this.move = function () {
		this.dialogTransaction(
				TaskService.move(this.task, this.selectedTasklist()));
	}.bind(this);

	this.removeConfirmed = ko.observable(false);
	this.confirmRemove = function () {
		this.removeConfirmed(true);
	}.bind(this);
	this.remove = function () {
		this.dialogTransaction(
				TaskService.remove(taskdata, this.task));
	}.bind(this);
};

/**
 * @class Dialog to create a tasklist.
 */
function CreateTasklistDialog () {
	this.initialize.apply(this, arguments);
};

CreateTasklistDialog.factory = function (taskdata) {
	return new CreateTasklistDialog(taskdata);
};

/**
 * @param {Taskdata}
 *            taskdata
 */
CreateTasklistDialog.prototype.initialize = function (taskdata) {
	this.title = ko.observable();
	this.save = function () {
		if (this.title()) {
			this.dialogTransaction(
					TasklistService.create(taskdata, {
						title: this.title()
					}));
		}
	}.bind(this);
};

/**
 * @class Dialog to update the tasklist.
 */
function UpdateTasklistDialog () {
	this.initialize.apply(this, arguments);
};

UpdateTasklistDialog.factory = function (taskdata, tasklistViewModel, event) {
	return new UpdateTasklistDialog(taskdata, tasklistViewModel);
};

/**
 * @param {Taskdata}
 *            taskdata
 * @param {Tasklist}
 *            tasklist
 */
UpdateTasklistDialog.prototype.initialize = function (taskdata, tasklist) {
	this.tasklist = tasklist;

	this.title = ko.observable(this.tasklist.title());
	this.save = function () {
		if (this.title()) {
			this.dialogTransaction(
					TasklistService.update(this.tasklist, {
						title: this.title
					}));
		}
	}.bind(this);

	this.removeConfirmed = ko.observable(false);
	this.confirmRemove = function () {
		this.removeConfirmed(true);
	}.bind(this);
	this.remove = function () {
		this.dialogTransaction(
				TasklistService.remove(taskdata, this.tasklist));
	}.bind(this);
};
