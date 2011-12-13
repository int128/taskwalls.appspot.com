(function (s) {
	for (var i in s) {
		document.write('<'+'script type="text/javascript" src="'+s[i]+'"></'+'script'+'>');
	} 
})([
'/js/src/app.js',
'/js/src/jquery.cookie.js',
'/js/src/util.js',
'/js/src/model.js',
'/js/src/view.page.js',
'/js/src/view.calendar.js',
'/js/src/view.header.js'
]);