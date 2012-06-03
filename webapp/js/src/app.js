$(function () {
	new OAuth2Session(function () {
		this.onAuthorized = function () {
			$('.oauth2state:not(.authorized)').remove();
			$('.oauth2state').show();
			ko.applyBindings(window.taskwallsPageVM = new AuthorizedPageViewModel());
		};
		this.onAuthorizing = function () {
			$('.oauth2state:not(.authorizing)').remove();
			$('.oauth2state').show();
			// clean up cache
			localStorage.clear();
		};
		this.onUnauthorized = function () {
			$('.oauth2state:not(.unauthorized)').remove();
			$('.oauth2state').show();
			// TODO: need to bind?
			$('.session-login').attr('href', this.getAuthorizationURL());
		};
	}).handle();
});
(function () {
	// extensions
	$.extend({
		/**
		 * Get resource from document.
		 * @param {String} key
		 * @returns {String}
		 */
		resource: function (key) {
			return $('#resources>[data-key="' + key + '"]').text();
		}
	});
	// global error handler
	var _window_onerror_handling = false;
	window.onerror = function () {
		if (!_window_onerror_handling) {
			_window_onerror_handling = true;
			$('#loading').hide();
			$('#global-errors').text($.resource('global-errors')).fadeIn();
		}
		_window_onerror_handling = false;
	};
	$('#global-errors').click(function () {
		$(this).fadeOut();
	});
	// ajax handler
	$(document).ajaxStart(function (event, xhr) {
		$('#global-errors').fadeOut();
		$('#loading').fadeIn();
	});
	$(document).ajaxStop(function (event, xhr) {
		$('#loading').fadeOut();
	});
	$('#loading').hide();
})();
