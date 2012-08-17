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

// app constants
var taskwalls = {};
taskwalls.settings = {};
// colors
taskwalls.settings.tasklistColors = 24;
// today (to update view when date changed)
taskwalls.settings.today = ko.observable(DateUtil.normalize(new Date()));
// last date of AJAX loading
taskwalls.settings.lastCached = ko.observable(new Date(parseInt(localStorage['cachedDate'])));
ko.computed(function () {
	localStorage['cachedDate'] = taskwalls.settings.lastCached().getTime();
});
// is offline mode?
taskwalls.settings.offline = ko.observable(sessionStorage['offline'] == 'true');
ko.computed(function () {
	sessionStorage['offline'] = taskwalls.settings.offline();
});
// is development environment?
taskwalls.settings.development = ko.observable(location.hostname.search('.appspot.com') == -1);
