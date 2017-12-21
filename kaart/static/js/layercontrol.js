/** Raadionuppudega layercontrol.
*   -----------------------------
*   Allolev on Copy-Paste Leafleti enda L.Control.Layer koodist
*   https://github.com/Leaflet/Leaflet/blob/master/src/control/Control.Layers.js
*   (seisuga 2017.12.20) litsentseeritud BSD-2 alusel (vt
*   https://github.com/Leaflet/Leaflet/blob/master/LICENSE)
*   Kohati kergelt kohendatud, et oleks võimalik osade kihtide valikus kasutada
*   ka "raadio-nuppe".
*
*   A copy-paste from Leaflet's own code for L.Control.Layer
*   https://github.com/Leaflet/Leaflet/blob/master/src/control/Control.Layers.js
*   (2017.12.20) licensed under BSD-2
*   (https://github.com/Leaflet/Leaflet/blob/master/LICENSE)
*   Very slightly hacked to incorporate grouping different overlay layers so
*   their visibility can be driven with a group of radiobuttons.
*
*/

L.Control.GroupedLayer = L.Control.extend({
    options: {
		// @option collapsed: Boolean = true
		// If `true`, the control will be collapsed into an icon and expanded on mouse hover or touch.
		collapsed: true,
		position: 'topright',

		// @option autoZIndex: Boolean = true
		// If `true`, the control will assign zIndexes in increasing order to all of its layers so that the order is preserved when switching them on/off.
		autoZIndex: true,

		// @option hideSingleBase: Boolean = false
		// If `true`, the base layers in the control will be hidden when there is only one.
		hideSingleBase: false,

		// @option sortLayers: Boolean = false
		// Whether to sort the layers. When `false`, layers will keep the order
		// in which they were added to the control.
		sortLayers: false,

        // @option radioGroups: Array = []
        // Lists layer-groups that should have exclusive content.
        // Added hack
        radioGroups: [],

		// @option sortFunction: Function = *
		// A [compare function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
		// that will be used for sorting the layers, when `sortLayers` is `true`.
		// The function receives both the `L.Layer` instances and their names, as in
		// `sortFunction(layerA, layerB, nameA, nameB)`.
		// By default, it sorts layers alphabetically by their name.
		sortFunction: function (layerA, layerB, nameA, nameB) {
			return nameA < nameB ? -1 : (nameB < nameA ? 1 : 0);
		}
	},

	initialize: function (baseLayers, overlays, options) {
		L.Util.setOptions(this, options);

		this._layerControlInputs = [];
		this._layers = [];
		this._lastZIndex = 0;
		this._handlingClick = false;

		for (var i in baseLayers) {
			this._addLayer(baseLayers[i], i);
		}

		for (i in overlays) {
			this._addLayer(overlays[i], i, true);
		}
	},

	onAdd: function (map) {
		this._initLayout();
		this._update();

		this._map = map;
		map.on('zoomend', this._checkDisabledLayers, this);

		for (var i = 0; i < this._layers.length; i++) {
			this._layers[i].layer.on('add remove', this._onLayerChange, this);
		}

		return this._container;
	},

	addTo: function (map) {
		L.Control.prototype.addTo.call(this, map);
		// Trigger expand after Layers Control has been inserted into DOM so that is now has an actual height.
		return this._expandIfNotCollapsed();
	},

	onRemove: function () {
		this._map.off('zoomend', this._checkDisabledLayers, this);

		for (var i = 0; i < this._layers.length; i++) {
			this._layers[i].layer.off('add remove', this._onLayerChange, this);
		}
	},

	// @method addBaseLayer(layer: Layer, name: String): this
	// Adds a base layer (radio button entry) with the given name to the control.
	addBaseLayer: function (layer, name) {
		this._addLayer(layer, name);
		return (this._map) ? this._update() : this;
	},

	// @method addOverlay(layer: Layer, name: String): this
	// Adds an overlay (checkbox entry) with the given name to the control.
    // Group name property is an added hack.
	addOverlay: function (layer, name, group) {
		this._addLayer(layer, name, true, group);
		return (this._map) ? this._update() : this;
	},

	// @method removeLayer(layer: Layer): this
	// Remove the given layer from the control.
	removeLayer: function (layer) {
		layer.off('add remove', this._onLayerChange, this);

		var obj = this._getLayer(L.Util.stamp(layer));
		if (obj) {
			this._layers.splice(this._layers.indexOf(obj), 1);
		}
		return (this._map) ? this._update() : this;
	},

	// @method expand(): this
	// Expand the control container if collapsed.
	expand: function () {
		L.DomUtil.addClass(this._container, 'leaflet-control-layers-expanded');
		this._form.style.height = null;
		var acceptableHeight = this._map.getSize().y - (this._container.offsetTop + 50);
		if (acceptableHeight < this._form.clientHeight) {
			L.DomUtil.addClass(this._form, 'leaflet-control-layers-scrollbar');
			this._form.style.height = acceptableHeight + 'px';
		} else {
			L.DomUtil.removeClass(this._form, 'leaflet-control-layers-scrollbar');
		}
		this._checkDisabledLayers();
		return this;
	},

	// @method collapse(): this
	// Collapse the control container if expanded.
	collapse: function () {
		L.DomUtil.removeClass(this._container, 'leaflet-control-layers-expanded');
		return this;
	},

	_initLayout: function () {
		var className = 'leaflet-control-layers',
		    container = this._container = L.DomUtil.create('div', className),
		    collapsed = this.options.collapsed;

		// makes this work on IE touch devices by stopping it from firing a mouseout event when the touch is released
		container.setAttribute('aria-haspopup', true);

		L.DomEvent.disableClickPropagation(container);
		L.DomEvent.disableScrollPropagation(container);

		var form = this._form = L.DomUtil.create('form', className + '-list');

		if (collapsed) {
			this._map.on('click', this.collapse, this);

			if (!L.Browser.android) {
				L.DomEvent.on(container, {
					mouseenter: this.expand,
					mouseleave: this.collapse
				}, this);
			}
		}

		var link = this._layersLink = L.DomUtil.create('a', className + '-toggle', container);
		link.href = '#';
		link.title = 'Layers';

		if (L.Browser.touch) {
			L.DomEvent.on(link, 'click', L.DomEvent.stop);
			L.DomEvent.on(link, 'click', this.expand, this);
		} else {
			L.DomEvent.on(link, 'focus', this.expand, this);
		}

		if (!collapsed) {
			this.expand();
		}

		this._baseLayersList = L.DomUtil.create('div', className + '-base', form);
		this._separator = L.DomUtil.create('div', className + '-separator', form);
		this._overlaysList = L.DomUtil.create('div', className + '-overlays', form);

		container.appendChild(form);
	},

	_getLayer: function (id) {
		for (var i = 0; i < this._layers.length; i++) {

			if (this._layers[i] && L.Util.stamp(this._layers[i].layer) === id) {
				return this._layers[i];
			}
		}
	},

	_addLayer: function (layer, name, overlay, group) {
		if (this._map) {
			layer.on('add remove', this._onLayerChange, this);
		}

		this._layers.push({
			layer: layer,
			name: name,
			overlay: overlay,
            group: group
		});

		if (this.options.sortLayers) {
			this._layers.sort(L.Util.bind(function (a, b) {
				return this.options.sortFunction(a.layer, b.layer, a.name, b.name);
			}, this));
		}

		if (this.options.autoZIndex && layer.setZIndex) {
			this._lastZIndex++;
			layer.setZIndex(this._lastZIndex);
		}

		this._expandIfNotCollapsed();
	},

	_update: function () {
		if (!this._container) { return this; }

		L.DomUtil.empty(this._baseLayersList);
		L.DomUtil.empty(this._overlaysList);

		this._layerControlInputs = [];
		var baseLayersPresent, overlaysPresent, i, obj, baseLayersCount = 0;

		for (i = 0; i < this._layers.length; i++) {
			obj = this._layers[i];
			this._addItem(obj);
			overlaysPresent = overlaysPresent || obj.overlay;
			baseLayersPresent = baseLayersPresent || !obj.overlay;
			baseLayersCount += !obj.overlay ? 1 : 0;
		}

		// Hide base layers section if there's only one layer.
		if (this.options.hideSingleBase) {
			baseLayersPresent = baseLayersPresent && baseLayersCount > 1;
			this._baseLayersList.style.display = baseLayersPresent ? '' : 'none';
		}

		this._separator.style.display = overlaysPresent && baseLayersPresent ? '' : 'none';

		return this;
	},

	_onLayerChange: function (e) {
		if (!this._handlingClick) {
			this._update();
		}

		var obj = this._getLayer(L.Util.stamp(e.target));

		// @namespace Map
		// @section Layer events
		// @event baselayerchange: LayersControlEvent
		// Fired when the base layer is changed through the [layer control](#control-layers).
		// @event overlayadd: LayersControlEvent
		// Fired when an overlay is selected through the [layer control](#control-layers).
		// @event overlayremove: LayersControlEvent
		// Fired when an overlay is deselected through the [layer control](#control-layers).
		// @namespace Control.Layers
		var type = obj.overlay ?
			(e.type === 'add' ? 'overlayadd' : 'overlayremove') :
			(e.type === 'add' ? 'baselayerchange' : null);

		if (type) {
			this._map.fire(type, obj);
		}
	},

	// IE7 bugs out if you create a radio dynamically, so you have to do it this hacky way (see http://bit.ly/PqYLBe)
	_createRadioElement: function (name, checked) {

		var radioHtml = '<input type="radio" class="leaflet-control-layers-selector" name="' +
				name + '"' + (checked ? ' checked="checked"' : '') + '/>';

		var radioFragment = document.createElement('div');
		radioFragment.innerHTML = radioHtml;

		return radioFragment.firstChild;
	},

	_addItem: function (obj) {

		var label = document.createElement('label'),
		    checked = this._map.hasLayer(obj.layer),
		    input,
            group = obj.group,
            groupName;

        if (group) {
            groupName = group.replace(' ', '-');
        }

		if (obj.overlay && !group) {
			input = document.createElement('input');
			input.type = 'checkbox';
			input.className = 'leaflet-control-layers-selector';
			input.defaultChecked = checked;
        } else if (obj.overlay && group) {
            input = this._createRadioElement('leaflet-control-layers-selector-' + groupName, checked);
		} else {
			input = this._createRadioElement('leaflet-base-layers', checked);
		}

		this._layerControlInputs.push(input);
		input.layerId = L.Util.stamp(obj.layer);

		L.DomEvent.on(input, 'click', this._onInputClick, this);

		var name = document.createElement('span');
		name.innerHTML = ' ' + obj.name;

		// Helps from preventing layer control flicker when checkboxes are disabled
		// https://github.com/Leaflet/Leaflet/issues/2771
		var holder = document.createElement('div');

		label.appendChild(holder);
		holder.appendChild(input);
		holder.appendChild(name);

        var container = obj.overlay ? this._overlaysList : this._baseLayersList;

        if (group) {
            var groupId = 'leaflet-control-layers-group-' + groupName;
            holder.className = 'leaflet-control-layers-group-option';
            //var groupContainer = document.getElementById('leaflet-control-layers-group');
            var groupContainer = document.getElementById(groupId);
            if (!groupContainer) {
                groupContainer = document.createElement('div');

                //groupContainer.id = 'leaflet-control-layers-group'; // peaks tegelt olema unikaalne sellele grupile
                groupContainer.id = groupId;

                var groupLabel = document.createElement('label'),
                    groupName = document.createElement('span');
                groupName.innerHTML = ' ' + group;
                groupLabel.appendChild(groupName);
                groupContainer.appendChild(groupLabel);
            }
            groupContainer.appendChild(label);

            container.appendChild(groupContainer);
        } else {
		    container.appendChild(label);
        }

		this._checkDisabledLayers();
		return label;
	},

	_onInputClick: function () {
		var inputs = this._layerControlInputs,
		    input, layer;
		var addedLayers = [],
		    removedLayers = [];

		this._handlingClick = true;

		for (var i = inputs.length - 1; i >= 0; i--) {
			input = inputs[i];
			layer = this._getLayer(input.layerId).layer;

			if (input.checked) {
				addedLayers.push(layer);
			} else if (!input.checked) {
				removedLayers.push(layer);
			}
		}

		// Bugfix issue 2318: Should remove all old layers before readding new ones
		for (i = 0; i < removedLayers.length; i++) {
			if (this._map.hasLayer(removedLayers[i])) {
				this._map.removeLayer(removedLayers[i]);
			}
		}
		for (i = 0; i < addedLayers.length; i++) {
			if (!this._map.hasLayer(addedLayers[i])) {
				this._map.addLayer(addedLayers[i]);
			}
		}

		this._handlingClick = false;

		this._refocusOnMap();
	},

	_checkDisabledLayers: function () {
		var inputs = this._layerControlInputs,
		    input,
		    layer,
		    zoom = this._map.getZoom();

		for (var i = inputs.length - 1; i >= 0; i--) {
			input = inputs[i];
			layer = this._getLayer(input.layerId).layer;
			input.disabled = (layer.options.minZoom !== undefined && zoom < layer.options.minZoom) ||
			                 (layer.options.maxZoom !== undefined && zoom > layer.options.maxZoom);

		}
	},

	_expandIfNotCollapsed: function () {
		if (this._map && !this.options.collapsed) {
			this.expand();
		}
		return this;
	},

	_expand: function () {
		// Backward compatibility, remove me in 1.1.
		return this.expand();
	},

	_collapse: function () {
		// Backward compatibility, remove me in 1.1.
		return this.collapse();
	}
});

L.control.groupedLayer = function (baseLayers, overlays, options) {
  return new L.Control.GroupedLayer(baseLayers, overlays, options);
};
