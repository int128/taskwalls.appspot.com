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
					// hide original element
					$(this).css('visibility', 'hidden');
				},
				stop: function (e, ui) {
					// restore original element
					$(this).css('visibility', 'visible');
				}
			}, options));
		}
};
/**
 * Droppable binding.
 * <code>
 * droppable: {context: hoge, hoverClass: 'dropping'}
 * </code>
 */
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
			var $element = $(element),
				options = ko.utils.unwrapObservable(valueAccessor()),
				context = options.context;  // pass to draggable event handler
			if (context === undefined) {
				context = viewModel;
			}
			delete options.context;
			$element.droppable($.extend({
				addClasses: false,
				tolerance: 'pointer',
				drop: function (e, ui) {
					ui.draggable.trigger('dropped', [context]);
				}
			}, options));
		}
};
/**
 * Key down event binding for ESC key.
 */
ko.bindingHandlers.escKeydown = {
		/**
		 * Initialize binding.
		 * @param {Element} element
		 * @param valueAccessor
		 * @param allBindingsAccessor
		 * @param viewModel
		 * @returns
		 */
		init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
			var $element = $(element), handler = valueAccessor();
			$element.keydown(function (e) {
				if (e.keyCode == 27) {
					return handler.call(viewModel, e);
				}
			});
		}
};
/**
 * Text binding that supports URL.
 */
ko.bindingHandlers.urlText = {
		/**
		 * Update value.
		 * @param {Element} element
		 * @param valueAccessor
		 * @param allBindingsAccessor
		 * @param viewModel
		 * @returns
		 */
		update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
			$(element).empty();
			var text = ko.utils.unwrapObservable(valueAccessor());
			if (text) {
				$.each(text.split(/[\r\n]+/), function (i, line) {
					var div = $(document.createElement('div'));
					div.text(line);
					div.html(div.html().replace(
							/(https?:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)/g,
							'<a href="$1" target="_blank">$1</a>'));
					div.appendTo(element);
				});
			}
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
