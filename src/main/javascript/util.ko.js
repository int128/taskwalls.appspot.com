/**
 * Drag and drop binding.
 */
ko.bindingHandlers.draggableByClone = {
	/**
	 * Initialize binding.
	 * 
	 * @param {Element}
	 *            element
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
 * Droppable binding. <code>
 * droppable: {context: hoge, hoverClass: 'dropping'}
 * </code>
 */
ko.bindingHandlers.droppable = {
	/**
	 * Initialize binding.
	 * 
	 * @param {Element}
	 *            element
	 * @param valueAccessor
	 * @param allBindingsAccessor
	 * @param viewModel
	 * @returns
	 */
	init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
		var $element = $(element);
		var options = ko.utils.unwrapObservable(valueAccessor());
		var context = options.context; // pass to draggable event handler
		if (context === undefined) {
			context = viewModel;
		}
		delete options.context;
		$element.droppable($.extend({
			addClasses: false,
			tolerance: 'pointer',
			drop: function (e, ui) {
				ui.draggable.trigger('dropped', [ context ]);
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
	 * 
	 * @param {Element}
	 *            element
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
ko.bindingHandlers.autolinkText = {
	/**
	 * Update value.
	 * 
	 * @param {Element}
	 *            element
	 * @param valueAccessor
	 * @param allBindingsAccessor
	 * @param viewModel
	 * @returns
	 */
	update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
		var $element = $(element), text = ko.utils.unwrapObservable(valueAccessor());
		if (text) {
			$element.text(text);
			$element.html($element.html().replace(
					/(https?:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)/g,
					'<a href="$1" target="_blank" data-bind="click: $.noopTrue, clickBubble: false">$1</a>'));
		}
	}
};

/**
 * Copy or update properties in the source into the destination. This function behaves like <code>$.extend()</code>.
 * 
 * @param {Object}
 *            destination
 * @param {Object}
 *            source
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
