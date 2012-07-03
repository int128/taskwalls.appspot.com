/**
 * バインドした要素がクリックされるとハンドラを実行する。
 * ただし、data-intercept属性でclickを指定された子要素がクリックされた場合は、
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
				if ($(event.target).data('intercept') == 'click') {
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
 * Drag and drop binding.
 */
ko.bindingHandlers.draggableByClone = {
		/**
		 * Initialize binding.
		 * @param {Element} element
		 * @param valueAccessor
		 * @param allBindingsAccessor
		 * @param viewModel
		 * @returns
		 */
		init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
			var $element = $(element), options = ko.utils.unwrapObservable(valueAccessor());
			$element.draggable($.extend({
				addClasses: false,
				helper: 'clone',
				appendTo: 'body',
				start: function (e, ui) {
					$(this).hide();
				},
				stop: function (e, ui) {
					$(this).show();
				}
			}, options));
		}
};
ko.bindingHandlers.droppable = {
		/**
		 * Initialize binding.
		 * @param {Element} element
		 * @param valueAccessor
		 * @param allBindingsAccessor
		 * @param viewModel
		 * @returns
		 */
		init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
			var $element = $(element), options = ko.utils.unwrapObservable(valueAccessor());
			$element.droppable($.extend({
				addClasses: false,
				tolerance: 'pointer',
				drop: function (e, ui) {
					ui.draggable.trigger('dropped', [viewModel]);
				}
			}, options));
		}
};
/**
 * Create a <code>ko.observable()</code> with constructor and disposer.
 * Managed instance has <code>dispose()</code> method to dispose itself.
 * @param {Function} constructor function that returns new instance
 * @param {Object} thisArg this object that will be passed to constructor
 * @returns {Object} <code>ko.observable()</code> instance
 */
ko.disposableObservable = function (constructor, thisArg) {
	var observable = ko.observable();
	observable.create = function () {
		var instance = constructor.apply(thisArg, arguments);
		// inject method
		instance.dispose = function () {
			observable(null);
		};
		observable(instance);
	};
	observable.dispose = function () {
		observable(null);
	};
	return observable;
};
/**
 * Copy or update properties in the source into the destination.
 * This function behaves like <code>$.extend()</code>.
 * @param {Object} destination
 * @param {Object} source
 */
ko.extendObservables = function (destination, source) {
	$.each(source, function (key, value) {
		(function (k, v) {
			// update value
			if (ko.isObservable(destination[k])) {
				destination[k](v);
			} else {
				destination[k] = ko.observable(v);
			}
		})(key, (function (v) {
			// unwrap if needed
			if (ko.isObservable(v)) {
				return v();
			} else {
				return v;
			}
		})(value));
	});
};
