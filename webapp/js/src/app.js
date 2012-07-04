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
$(function () {
	taskwalls.session.onAuthorized = function () {
		$('.oauth2state:not(.authorized)').remove();
		$('.oauth2state').show();
		ko.applyBindings(taskwalls.pagevm = new AuthorizedPageViewModel());
	};
	taskwalls.session.onAuthorizing = function () {
		$('.oauth2state:not(.authorizing)').remove();
		$('.oauth2state').show();
	};
	taskwalls.session.onUnauthorized = function () {
		$('.oauth2state.unauthorized>.tryout').append($('.navheader,.calendar,.icebox'));
		$('.oauth2state:not(.unauthorized)').remove();
		$('.oauth2state').show();
		$('.login a').attr('href', this.getAuthorizationURL());
		// FIXME: mock
		ko.applyBindings(taskwalls.pagevm = new AuthorizedPageViewModel());
	};
	taskwalls.session.handle();
});
var taskwalls = {
		settings: new AppSettings(),
		session: new OAuth2Session()
};
$(function () {
	$(document).tooltip({
		selector: '.with-tooltip'
	});
});
