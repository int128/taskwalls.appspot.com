(function (s) {
	for (var i in s) {
		document.write('<'+'script type="text/javascript" src="'+s[i]+'"></'+'script'+'>');
	} 
})([
'/js/lib/jquery-1.7.1.js',
'/js/lib/jquery-ui-1.8.16.js',
'/js/src/jquery.cookie.js',
'/js/src/util.js',
'/js/src/model.js',
'/js/src/view.page.js',
'/js/src/view.calendar.js',
'/js/src/view.header.js',
'/js/src/app.js'
]);