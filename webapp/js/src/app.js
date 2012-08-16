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
var taskwalls = {
	settings: new AppSettings()
};
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
/**
 * simple URL router
 */
var LocationHashRouter = {};
/**
 * route by given rules
 * @param {Object} rules map of hash and function
 */
LocationHashRouter.route = function (rules) {
	var func = rules[location.hash];
	if ($.isFunction(func)) {
		func.call();
	} else {
		rules['default'].call();
	}
};
