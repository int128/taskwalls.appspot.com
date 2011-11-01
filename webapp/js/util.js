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
 * @param {Date} date
 * @returns {Number} time in UTC
 */
DateUtil.getUTCTime = function (date) {
	return date.getTime() - date.getTimezoneOffset() * 60 * 1000;
};
/**
 * @class Form controller for the AJAX API.
 * @param {HTMLFormElement} form
 */
function FormController (form) {
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
FormController.prototype.enable = function () {
	$('button', this.form).removeAttr('disabled');
};
FormController.prototype.disable = function () {
	$('button', this.form).attr({disabled: 'disabled'});
};
/**
 * Set the validator.
 * @param {Function} validator
 * @returns {FormController}
 */
FormController.prototype.validator = function (validator) {
	this.validate = validator;
	return this;
};
/**
 * Default validator. Always returns true.
 * @param {HTMLFormElement} form
 * @returns {Boolean}
 */
FormController.prototype.validate = function (form) {
	return true;
};
/**
 * Set the result handler.
 * @param {Function} success
 * @returns {FormController}
 */
FormController.prototype.success = function (success) {
	this.handleSuccess = success;
	return this;
};
/**
 * Default result handler.
 * @param data
 */
FormController.prototype.handleSuccess = function (data) {
	return;
};
/**
 * Set the error handler.
 * @param {Function} error
 * @returns {FormController}
 */
FormController.prototype.error = function (error) {
	this.handleError = error;
	return this;
};
/**
 * Default error handler.
 */
FormController.prototype.handleError = function () {
	return;
};
/**
 * Set the cancel handler.
 * @param {Function} cancel
 * @returns {FormController}
 */
FormController.prototype.cancel = function (cancel) {
	this.cancelHandler = cancel;
	return this;
};
/**
 * Default cancel handler.
 */
FormController.prototype.cancelHandler = function () {
	return;
};
