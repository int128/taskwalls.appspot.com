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
(function () {
	// global error handler
	var _window_onerror_handling = false;
	window.onerror = function () {
		if (!_window_onerror_handling) {
			_window_onerror_handling = true;
			$('#global-errors').text($.resource('global-errors')).show();
			$('#loading').hide();
		}
		_window_onerror_handling = false;
	};
	$('#global-errors').click(function () {
		$(this).fadeOut();
	});
	$('#loading').hide();
	// use ajaxSend() instead of ajaxStart()
	// because ajaxStart() is never called since AJAX error occurred
	$(document).ajaxSend(function () {
		$('#loading').fadeIn();
		$('#global-errors').hide();
	});
	$(document).ajaxStop(function () {
		$('#loading').fadeOut();
	});
})();
$(function () {
	taskwalls.session.onAuthorized = function () {
		$('.oauth2state:not(.authorized)').remove();
		$('.oauth2state').show();
		ko.applyBindings(taskwalls.pagevm = new AuthorizedPageViewModel());
		taskwalls.pagevm.load();
	};
	taskwalls.session.onAuthorizing = function () {
		$('.oauth2state:not(.authorizing)').remove();
		$('.oauth2state').show();
	};
	taskwalls.session.onUnauthorized = function () {
		// move some elements
		$('.oauth2state.unauthorized>.tryout').append($('.navheader,.calendar,.icebox'));
		$('.oauth2state.unauthorized').append($('.dialogs'));

		$('.oauth2state:not(.unauthorized)').remove();
		$('.oauth2state').show();
		$('.login a').attr('href', this.getAuthorizationURL());
		ko.applyBindings(taskwalls.pagevm = new TryOutPageViewModel());
	};
	taskwalls.session.handle();
});
var taskwalls = {
		settings: new AppSettings(),
		session: new OAuth2Session()
};
$(function () {
	$(document).tooltip({
		selector: '.showtooltip'
	});
});
