/**
 * @class UI element of the header bar.
 * @param {UIPage} page
 */
function UIHeader (page) {
	this.element = $('#myheader');
	$('.toggle-tasks.needsAction', this.element).click(function () {
		$('.task-status-needsAction').fadeToggle();
		return false;
	});
	$('.toggle-tasks.completed', this.element).click(function () {
		$('.task-status-completed').fadeToggle();
		return false;
	});
	$('a[href="#reload"]', this.element).click(function () {
		page.refresh();
		return false;
	});
	$('a[href="#create-tasklist"]', this.element).click(function () {
		new UINewTasklist().open(page.tasklists);
		return false;
	});
};
/**
 * @class UI element of {@link Tasklists}.
 */
function UITasklists () {
	this.clear();
};
/**
 * Clear tasklists.
 */
UITasklists.prototype.clear = function () {
	$('#tasklists').empty();
};
/**
 * Add a tasklist.
 * @param {UITasklist} uiTasklist
 */
UITasklists.prototype.add = function (uiTasklist) {
	$('#tasklists').append(uiTasklist.getElement());
};
/**
 * UI element of the tasklist.
 * @param {Tasklist} tasklist the tasklist
 * @param {Boolean} defaultTasklist true if the tasklist is default one
 */
function UITasklist (tasklist, defaultTasklist) {
	this.defaultTasklist = defaultTasklist;
	this.refresh(tasklist);
};
/**
 * Get the element.
 * @returns {Element}
 */
UITasklist.prototype.getElement = function () {
	return this.element;
};
/**
 * @returns {Tasklist} the tasklist
 */
UITasklist.prototype.getTasklist = function () {
	return this.tasklist;
};
/**
 * @returns {Boolean} true if the tasklist is default one
 */
UITasklist.prototype.isDefault = function () {
	return this.defaultTasklist;
};
/**
 * Refresh view of this tasklist item.
 * @param {Tasklist} tasklist the tasklist
 */
UITasklist.prototype.refresh = function (tasklist) {
	var context = this;
	var originalElement = this.element;
	this.tasklist = tasklist;
	this.element = $.resource('tasklist-legend-template')
		.addClass('tasklistcolor-' + tasklist.colorID)
		.click(function () {
			new UIUpdateTasklist().open(context);
		});
	$('.title', this.element).text(tasklist.title);
	$('.toggle', this.element).click(function () {
		context.toggle();
		return false;
	});
	// replace if already exists
	if (originalElement) {
		originalElement.replaceWith(this.element);
	}
};
/**
 * Change color of the tasklist.
 * @param {Number} colorID
 */
UITasklist.prototype.changeColor = function (colorID) {
	$('.tasklist-' + this.tasklist.id)
		.removeClass('tasklistcolor-' + this.tasklist.colorID)
		.addClass('tasklistcolor-' + colorID);
	this.element
		.removeClass('tasklistcolor-' + this.tasklist.colorID)
		.addClass('tasklistcolor-' + colorID);
	this.tasklist.colorID = colorID;
};
/**
 * Toggle tasks of the tasklist.
 */
UITasklist.prototype.toggle = function () {
	this.element.toggleClass('hidden');
	if (this.element.hasClass('hidden')) {
		$('.tasklist-' + this.tasklist.id).fadeOut();
	}
	else {
		$('.tasklist-' + this.tasklist.id).fadeIn();
	}
};
/**
 * Remove the tasklist and its tasks.
 */
UITasklist.prototype.remove = function () {
	$('.tasklist-' + this.tasklist.id).remove();
	this.element.remove();
};
/**
 * @class creating a tasklist dialog
 */
function UINewTasklist () {
	this.element = $.resource('create-tasklist-template');
	this.overlay = $.resource('popup-overlay-template');
};
/**
 * Open the dialog.
 * @param {UITasklists} uiTasklists
 */
UINewTasklist.prototype.open = function (uiTasklists) {
	var context = this;
	$('>form button', this.element).button();
	new FormController($('>form', this.element))
		.validator(function (form) {
			return $('input[name="title"]', form).val();
		})
		.success(function (created) {
			uiTasklists.add(new UITasklist(new Tasklist(created), false));
			context.close();
		})
		.cancel(function () {
			context.close();
		});
	this.element.appendTo('body').show();
	this.overlay.appendTo('body').show().click(function () {
		context.close();
	});
	$('>form input[name="title"]', this.element).focus();
};
/**
 * Close the dialog.
 */
UINewTasklist.prototype.close = function () {
	this.element.remove();
	this.overlay.remove();
};
/**
 * @class updating the tasklist
 */
function UIUpdateTasklist () {
	this.element = $.resource('update-tasklist-template');
	this.overlay = $.resource('transparent-overlay-template');
}
/**
 * Open the dialog.
 * @param {UITasklist} uiTasklist
 */
UIUpdateTasklist.prototype.open = function (uiTasklist) {
	var context = this;
	$('form button', this.element).button();
	// update the tasklist
	$('form.tasklist input[name="title"]', this.element).blur(function () {
		$(this).submit();
	});
	new FormController($('form.tasklist', this.element))
		.copyProperties(uiTasklist.getTasklist())
		.validator(function (form) {
			var title = $('input[name="title"]', form).val();
			return title && title != uiTasklist.getTasklist().title;
		})
		.success(function (updated) {
			uiTasklist.refresh(new Tasklist(updated));
		})
		.cancel(function () {
			context.close();
		});
	// delete the tasklist
	$('.confirm', this.element).hide();
	$('a[href="#delete"]', this.element).click(function () {
		$(this).hide();
		$('.confirm', this.element).show();
		return false;
	});
	new FormController($('form.delete', this.element))
		.copyProperties(uiTasklist.getTasklist())
		.success(function () {
			uiTasklist.remove();
			context.close();
		})
		.cancel(function () {
			context.close();
		});
	// update options of the tasklist
	new FormController($('form.options', this.element))
		.copyProperties(uiTasklist.getTasklist())
		.success(function () {
			uiTasklist.changeColor($('form.options input[name="colorID"]', context.element).val());
		})
		.cancel(function () {
			context.close();
		});
	$.each(Constants.tasklistColorIDs(), function (i, colorID) {
		$('<div class="tasklist-mark"/>')
			.addClass('tasklistcolor-' + colorID)
			.data('colorID', colorID)
			.appendTo($('.change-color', context.element));
	});
	$('.tasklist-mark', this.element).click(function () {
		$('form.options input[name="colorID"]', context.element).val($(this).data('colorID'));
		$(this).submit();
	});
	// etc
	$('.default', this.element).toggle(uiTasklist.isDefault());
	$('a[href="#toggle"]', this.element).click(function () {
		uiTasklist.toggle();
		return false;
	});
	this.overlay.appendTo('body').show().click(function () {
		context.close();
	});
	this.element.css({
		top: $(uiTasklist.getElement()).position().top
	}).appendTo('body');
};
/**
 * Close the dialog.
 */
UIUpdateTasklist.prototype.close = function () {
	this.element.remove();
	this.overlay.remove();
};
