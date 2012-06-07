/**
 * バインドした要素がクリックされるとハンドラを実行する。
 * ただし、intercept-clickクラスを持つ子要素がクリックされた場合は、
 * イベントを無視する。
 */
ko.bindingHandlers.overlappedClick = {
		/**
		 * Initialize binding.
		 * @param {Element} element
		 * @param valueAccessor
		 * @param allBindingsAccessor
		 * @param viewModel
		 * @returns
		 */
		init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
			var originalHandler = valueAccessor();
			var wrappedHandler = function (context, event) {
				if ($(event.target).hasClass('intercept-click')) {
					return true;
				} else {
					return originalHandler.apply(this, arguments);
				}
			};
			var wrappedValueAccessor = function () {
				return wrappedHandler;
			};
			return ko.bindingHandlers.click.init.call(this,
					element, wrappedValueAccessor, allBindingsAccessor, viewModel);
		}
};
/**
 * Create a <code>ko.observable()</code> with constructor and disposer.
 * @param {Function} constructor function that returns new instance
 * @param {Object} thisArg this object that will be passed to constructor
 * @returns {Object} <code>ko.observable()</code> instance
 */
function disposableObservable(constructor, thisArg) {
	var observable = ko.observable();
	observable.create = function () {
		observable(constructor.apply(thisArg, arguments));
	};
	observable.dispose = function () {
		observable(null);
	};
	return observable;
};
/**
 * Map properties of the model into the viewmodel.
 * @param {Object} model source
 * @param {Object} viewmodel target
 */
ko.mapObservables = function (model, viewmodel) {
	$.each(model, function (k, v) {
		viewmodel[k] = ko.observable(v);
	});
};
