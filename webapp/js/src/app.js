// controller
$(function () {
	$(window).bind('hashchange', function () {
		location.reload();
	});
	LocationHashRouter.route({
		'#tryout': function () {
			$('.oauth2state:not(.authorized)').remove();
			$('.oauth2state').show();
			ko.applyBindings(taskwalls.pagevm = new TryOutPageViewModel());
		},
		'default': function () {
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
	});
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
// app constants
var taskwalls = {
	settings: new AppSettings()
};
