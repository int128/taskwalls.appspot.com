// controller
$(function () {
	OAuth2Controller.handle({
		notAuthorizedYet: function () {
			if (location.search == '?demo') {
				$('.oauth2state:not(.authorized)').remove();
				$('.oauth2state').show();
				taskwalls.settings.offline(true);
				ko.applyBindings(taskwalls.pagevm = new TryOutPageViewModel());
				taskwalls.pagevm.load();
			} else {
				$('.oauth2state:not(.unauthorized)').remove();
				$('.oauth2state').show();
				$('.oauth2state .login').attr('href', OAuth2Controller.getAuthorizationURL());
			}
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
// last date of AJAX loading
taskwalls.settings.lastCached = ko.observable(new Date(parseInt(localStorage['cachedDate'])));
ko.computed(function () {
	localStorage['cachedDate'] = taskwalls.settings.lastCached().getTime();
});
// is offline mode?
taskwalls.settings.offline = ko.observable(
		sessionStorage['offline'] == 'true' || navigator.onLine == false);
ko.computed(function () {
	sessionStorage['offline'] = taskwalls.settings.offline();
});
$(window).on('online', taskwalls.settings.offline.bind(null, false));
$(window).on('offline', taskwalls.settings.offline.bind(null, true));
// is this session loaded by offline?
taskwalls.settings.offlineLoaded = ko.observable(false);
// is development environment?
taskwalls.settings.development = ko.observable(location.hostname.search('.appspot.com') == -1);
