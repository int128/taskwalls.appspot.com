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
