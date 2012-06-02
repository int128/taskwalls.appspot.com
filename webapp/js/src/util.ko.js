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
