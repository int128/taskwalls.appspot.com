/**
 * HTML5 native drag binding.
 * <ul>
 * <li>Specify <code>kind</code>.</li>
 * </ul>
 */
ko.bindingHandlers.draggable = {
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
		var events = ko.bindingHandlers.draggable.events;
		$element.on('dragstart', events.dragstart.bind(element, options, viewModel));
	},
	events: {
		dragstart: function (options, viewModel, event) {
			event.originalEvent.dataTransfer.effectAllowed = 'move';
			event.originalEvent.dataTransfer.setData('text/x-drag-kind', options.kind);
			ko.bindingHandlers.draggable.sourceViewModel = viewModel;
		}
	},
	sourceViewModel: undefined
};

/**
 * HTML5 native drop binding.
 * <ul>
 * <li>Specify <code>acceptableKind</code> to accept sources.</li>
 * <li>Specify a function as <code>drop</code> to handle events.</li>
 * <li>CSS class <code>dropover</code> is added while dropped over.</li>
 * <li></li>
 * </ul>
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
		var events = ko.bindingHandlers.droppable.events;
		$element.on('dragover', events.dragover);
		$element.on('dragenter', events.dragenter);
		$element.on('dragleave', events.dragleave);
		//$element.on('dragend', events.dragend);
		$element.on('drop', events.drop.bind(element, options, viewModel));
	},
	events: {
		dragover: function (event) {
			event.originalEvent.dataTransfer.dropEffect = 'move';
			event.originalEvent.preventDefault();
			return false;
		},
		dragenter: function (event) {
			$(this).addClass('dropover');
		},
		dragleave: function () {
			$(this).removeClass('dropover');
		},
		drop: function (options, viewModel, event) {
			$(this).removeClass('dropover');
			var kind = event.originalEvent.dataTransfer.getData('text/x-drag-kind');
			if (kind == options.acceptableKind) {
				options.drop.call(viewModel, ko.bindingHandlers.draggable.sourceViewModel, event);
				ko.bindingHandlers.draggable.sourceViewModel = undefined;
			}
			event.originalEvent.stopPropagation();
			return false;
		}
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
