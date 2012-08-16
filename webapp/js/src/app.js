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
$(function () {
	$(document).tooltip({
		selector: '.showtooltip'
	});
});
// user notifications
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
// controller
var taskwalls = {
	settings: new AppSettings()
};
var hashHandlers = {
	'#tryout': function () {
		$('.oauth2state:not(.authorized)').remove();
		$('.oauth2state').show();
		ko.applyBindings(taskwalls.pagevm = new TryOutPageViewModel());
	},
	any: function () {
		OAuth2Controller.handle({
			notAuthorizedYet: function () {
				$('.oauth2state:not(.unauthorized)').remove();
				$('.oauth2state').show();
				$('.oauth2state .login').attr('href', OAuth2Controller.getAuthorizationURL());
			},
			processingAuthorizationCode: function () {
				$('.oauth2state:not(.authorizing)').remove();
				$('.oauth2state').show();
			},
			alreadyAuthorized: function () {
				$('.oauth2state:not(.authorized)').remove();
				$('.oauth2state').show();
				ko.applyBindings(taskwalls.pagevm = new AuthorizedPageViewModel());
				taskwalls.pagevm.load();
			}
		});
	}
};
$(function () {
	$(window).bind('hashchange', function () {
		location.reload();
	});
	var handler = hashHandlers[location.hash];
	if ($.isFunction(handler)) {
		handler.call();
	} else {
		hashHandlers['any'].call();
	}
});
