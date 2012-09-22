$(function () {
	OAuth2Controller.handle({
		notAuthorizedYet: function () {
			if (location.search == '?demo') {
				$('.oauth2state:not(.authorized)').remove();
				$('.oauth2state').show();
				taskwalls.settings.offline(true);
				ko.applyBindings(taskwalls.pagevm = new DemoPageViewModel());
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
			$.ajaxSetup({
				contentType: 'application/json; charset=UTF-8',
				headers: {
					'X-TaskWall-Session': localStorage['session']
				},
				statusCode: {
					403: function () {
						// session has been expired
						location.replace(OAuth2Controller.getAuthorizationURL());
					},
					400: function (xhr, status, e) {
						// precondition error
						if (taskwalls.settings.development()) {
							throw e;
						} else {
							// Log out on production because change of API specification or data schema
							// may cause this error.
							OAuth2Controller.logout();
						}
					},
					500: function (xhr, status, e) {
						// server error
						throw e;
					}
				}
			});

			$('.oauth2state:not(.authorized)').remove();
			$('.oauth2state').show();
			ko.applyBindings(taskwalls.pagevm = new AuthorizedPageViewModel());
			taskwalls.pagevm.load();
		}
	});
});
