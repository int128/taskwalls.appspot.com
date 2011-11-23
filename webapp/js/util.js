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
/**
 * Enable buttons in the form.
 */
FormController.prototype.enable = function () {
	$(':submit', this.form).removeAttr('disabled');
	return this;
};
/**
 * Disable buttons in the form.
 */
FormController.prototype.disable = function () {
	$(':submit', this.form).attr({disabled: 'disabled'});
	return this;
};
/**
 * Copy properties to the form.
 * @param properties
 * @returns {FormController}
 */
FormController.prototype.copyProperties = function (properties) {
	$(':input', this.form).each(function () {
		if (properties[this.name]) {
			$(this).val(properties[this.name]);
		}
	});
	return this;
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
/**
 * Get hash code of {@link String}.
 * @returns {Number} hash code
 * @see http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
 */
String.prototype.hashCode = function () {
	var hash = 0;
	if (this.length == 0) {
		return hash;
	}
	for (var i = 0; i < this.length; i++) {
		var char = this.charCodeAt(i);
		hash = ((hash<<5)-hash)+char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return hash;
};
/**
 * @class OAuth 2.0 session controller.
 */
function OAuth2Session () {
	this.clientId = '965159379100.apps.googleusercontent.com';
};
/**
 * Handle current request.
 */
OAuth2Session.prototype.handle = function () {
	var authorizationCodeMatch = location.search.match(/\?code=(.*)/);
	if (authorizationCodeMatch) {
		// step2: received authorization code
		this.onAuthorizing();
		$.post('/oauth2', {code: authorizationCodeMatch[1]}, function () {
			location.replace(location.pathname);
		});
		return;
	}
	var authorizationErrorMatch = location.search.match(/\?error=/);
	if (authorizationErrorMatch) {
		// step2-1: authorization error
		location.replace(location.pathname);
		return;
	}
	if ($.cookie('s')) {
		// step3: authorized
		/**
		 * Add token to request header.
		 * @param {XMLHttpRequest} xhr
		 */
		$(document).ajaxSend(function (event, xhr) {
			xhr.setRequestHeader('X-TaskWall-Session', $.cookie('s'));
		});
		this.onAuthorized();
		return;
	}
	else {
		// step1: unauthorized
		this.onUnauthorized();
		return;
	}
};
/**
 * Get the login URL.
 * @returns {String} URL
 */
OAuth2Session.prototype.getLoginURL = function () {
	return 'https://accounts.google.com/o/oauth2/auth'
		+ '?redirect_uri=' + (location.protocol + '//' + location.host + location.pathname)
		+ '&response_type=code'
		+ '&scope=https://www.googleapis.com/auth/tasks'
		+ '&access_type=offline'
		+ '&client_id=' + this.clientId;
};
/**
 * Authorize.
 */
OAuth2Session.prototype.authorize = function () {
	$('#global-error-message').hide();
	location.replace(this.getLoginURL());
};
/**
 * Event handler for authorization in progress.
 */
OAuth2Session.prototype.onAuthorizing = function () {};
/**
 * Event handler on authorized.
 */
OAuth2Session.prototype.onAuthorized = function () {};
/**
 * Event handler for unauthorized.
 */
OAuth2Session.prototype.onUnauthorized = function () {};
/**
 * @class null implementation of web storage
 * @returns {NullStorage}
 */
function NullStorage () {
	this.length = 0;
}
NullStorage.prototype.key = function () {};
NullStorage.prototype.getItem = function () {};
NullStorage.prototype.setItem = function () {};
NullStorage.prototype.removeItem = function () {};
NullStorage.prototype.clear = function () {};
if (typeof localStorage == undefined) {
	localStorage = new NullStorage();
}
if (typeof sessionStorage == undefined) {
	sessionStorage = new NullStorage();
}
