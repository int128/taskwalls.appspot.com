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
	window.onerror = function () {
		$('#loading').hide();
		$('#global-errors').text($.resource('global-errors')).fadeIn();
	};
	$('#global-errors').click(function () {
		$(this).fadeOut();
	});
	// loading indicator
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
		$('.oauth2state:not(.unauthorized)').remove();
		$('.oauth2state').show();
		$('.login a').attr('href', this.getAuthorizationURL());
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
