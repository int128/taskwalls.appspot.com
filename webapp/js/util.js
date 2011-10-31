/**
 * @class DateUtil
 */
var DateUtil = {};
/**
 * @param {Date} date
 * @param future
 * @param today
 * @param past
 * @returns future, today or past
 */
DateUtil.futureOrPast = function (date, future, today, past) {
	var normalizedDate = new Date(date);
	var normalizedToday = new Date();
	normalizedDate.setHours(0, 0, 0, 0);
	normalizedToday.setHours(0, 0, 0, 0);
	if (normalizedDate > normalizedToday) {
		return future;
	}
	else if (normalizedDate < normalizedToday) {
		return past;
	}
	return today;
};
/**
 * @class Form for TaskWall AJAX API.
 * @param {HTMLFormElement} form
 */
function TaskWallApiForm (form) {
	this.form = form;
	var context = this;
	$(form).change(function () {
		if (context.validate(this)) {
			context.enable();
		}
		else {
			context.disable();
		}
	}).change();
	$(form).submit(function () {
		if (context.validate(this)) {
			context.disable();
			$.ajax({
				type: this.method,
				url: this.action,
				data: $(this).serialize(),
				dataType: 'json',
				success: context.handleSuccess,
				error: context.handleError,
				complete: function () {
					context.enable();
				}
			});
		}
		return false;
	});
	$(form).keydown(function (event) {
		if (event.keyCode == 27) { // ESC
			context.cancelHandler();
		}
	});
};
TaskWallApiForm.prototype.enable = function () {
	$('button', this.form).removeAttr('disabled');
};
TaskWallApiForm.prototype.disable = function () {
	$('button', this.form).attr({disabled: 'disabled'});
};
/**
 * Set the validator.
 * @param {Function} validator
 * @returns {TaskWallApiForm}
 */
TaskWallApiForm.prototype.validator = function (validator) {
	this.validate = validator;
	return this;
};
/**
 * Default validator. Always returns true.
 * @param {HTMLFormElement} form
 * @returns {Boolean}
 */
TaskWallApiForm.prototype.validate = function (form) {
	return true;
};
/**
 * Set the result handler.
 * @param {Function} success
 * @returns {TaskWallApiForm}
 */
TaskWallApiForm.prototype.success = function (success) {
	this.handleSuccess = success;
	return this;
};
/**
 * Default result handler.
 * @param data
 */
TaskWallApiForm.prototype.handleSuccess = function (data) {
	return;
};
/**
 * Set the error handler.
 * @param {Function} error
 * @returns {TaskWallApiForm}
 */
TaskWallApiForm.prototype.error = function (error) {
	this.handleError = error;
	return this;
};
/**
 * Default error handler.
 */
TaskWallApiForm.prototype.handleError = function () {
	return;
};
/**
 * Set the cancel handler.
 * @param {Function} cancel
 * @returns {TaskWallApiForm}
 */
TaskWallApiForm.prototype.cancel = function (cancel) {
	this.cancelHandler = cancel;
	return this;
};
/**
 * Default cancel handler.
 */
TaskWallApiForm.prototype.cancelHandler = function () {
	return;
};
