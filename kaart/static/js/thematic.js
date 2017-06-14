/** "Hiiglamavana" katse veebist päritava kahheldatud L-EST'97
koordinaatsüsteemis geojsoni joonistamiseks. Vajab päris korralikku
ümbervaatamist. Päris palju sellist, mida ei mäleta, miks just nii tehtud
nagu tehtud.

Siinne töö baseerub:

a) Leaflet.Renderer.SVG.Tile.js (vt https://github.com/Leaflet/Leaflet.VectorGrid),
litsentseeritud "THE BEER-WARE LICENSE" alusel, vt
https://github.com/Leaflet/Leaflet.VectorGrid#legalese


b) TileLayer.GeoJSON.js (vt https://github.com/glenrobertson/leaflet-tilelayer-geojson),
litsentseeritud BSD-2 alusel, vt
https://github.com/glenrobertson/leaflet-tilelayer-geojson/blob/master/LICENCE


Mõlemaid on modifitseeritud sellel määral, et "asi-töötaks" L-EST'97 (EPSG:3301)
koordinaatsüsteemis.

*/

L.SVG.Tile = L.SVG.extend({
    // UH-OH, mis see siin on siis?
    //_iconAnchor : L.point(-16, -32),
    _iconSize : L.point(8, 8),
    _iconAnchor : L.point(-4, -4),

    initialize: function (tileSize, options, tilePoint) {
        L.SVG.prototype.initialize.call(this, options);
        this._size = tileSize;
        this._locs = [];
        this._initContainer();
        this._container.setAttribute('width', this._size.x);
        this._container.setAttribute('height', this._size.y);
        this._container.setAttribute('viewBox', [0, 0, this._size.x, this._size.y].join(' '));
    },

    getContainer: function() {
        return this._container;
    },

    onAdd: function(map) {
        this._map = map;
    },

    _initContainer: function() {
        L.SVG.prototype._initContainer.call(this);
    },

    _initClipPath(tileX, tileY, tileZ) {
        var clipPath = L.SVG.create('clipPath'),
            defs = L.SVG.create('defs'),
            clipPathId = this._clipPathId = 'tileClipPath_' + tileZ + '_' + tileX + '_' + tileY;
            clipPath.id = clipPathId;

        var path = L.SVG.create('path'),
            pathString = L.SVG.pointsToPath(
                [
                    [
                        L.point(0,0), L.point(0, this._size.y),
                        L.point(this._size.x, this._size.y),
                        L.point(this._size.x, 0),
                        L.point(0, 0)
                    ]
                ],
                true);
        path.setAttribute('d', pathString);
        clipPath.appendChild(path);
        defs.appendChild(clipPath);
        this._container.insertBefore(defs, this._rootGroup);
    },

    _addPath: function(layer) {
        this._rootGroup.appendChild(layer._path);
    },

    _addIcon: function(layer) {
        this._rootGroup.appendChild(layer._path);
    },

    _initIcon: function(feat) {
        var img = feat._path = this._createImg();
        L.DomUtil.addClass(img, 'leaflet-interactive');
        return img;
    },

    _updateIconStyle: function (feat) {
        var icon = feat._path,
            style = feat.options || {},
            iconUrl, iconSize, loc;

        if (!icon) { return; }

        if (style.iconUrl) {
            iconUrl = style.iconUrl;
        } else {
            iconUrl = '../static/img/default-icon.png';
        }
        icon.setAttributeNS('http://www.w3.org/1999/xlink', 'href', iconUrl);

        if (style.iconSize) {
            // @TODO: NB! ikooni suurus ei pruugi olla sama kihi piires sama
            this._iconSize = L.point(style.iconSize);
            iconSize = style.iconSize;
        } else {
            iconSize = [this._iconSize.x,this._iconSize.y];
        }
        icon.setAttribute('width', iconSize[0]);
        icon.setAttribute('height', iconSize[1]);
        style._iconSize = iconSize;

        loc = feat._parts[0][0];
        if (style.iconAnchor) {
            // @TODO: NB! ikooni suurus ei pruugi olla sama kihi piires sama
            this._iconAnchor = L.point(style.iconAnchor);
            loc.x += style.iconAnchor[0];
            loc.y += style.iconAnchor[1];
        } else if (!style.iconUrl && !style.iconSize) {
            loc = loc.add(this._iconAnchor);
        }
        style._iconAnchor = loc;
        L.DomUtil.setPosition(icon, loc);
        this._locs.push(loc);
    },

    _getMarkerBounds: function() {
        return L.bounds(this._locs);
    },

    _getContainerResize: function() {
        var markerBounds = this._getMarkerBounds();
        if (markerBounds.min && markerBounds.max) {
            var dx = this._iconSize.x,
                dy = this._iconSize.y;
            var minx = 0, miny = 0, maxx = 0, maxy = 0;
            if (markerBounds.min.x < 0) {
                minx = markerBounds.min.x;
            }
            if (markerBounds.min.y < 0) {
                miny = markerBounds.min.y;
            }
            if ((markerBounds.max.x + dx) > this._size.x) {
                maxx = this._size.x - (markerBounds.max.x + dx);
            }
            if ((markerBounds.max.y + dy) > this._size.y) {
                maxy = this._size.y - (markerBounds.max.y + dy);
            }
            return Math.min(...[minx, miny, maxx, maxy]);
        } else {
            return false;
        }
    },

    _createImg: function(src) {
        var el = document.createElementNS('http://www.w3.org/2000/svg','image');
        el.src = src;
        return el;
    },
});

L.SVG.Tile.include(L.Layer);

L.svg.tile = function(tileSize, opts){
    return new L.SVG.Tile(tileSize, opts);
}


// https://gist.github.com/glenrobertson/6203331
// https://github.com/glenrobertson/leaflet-tilelayer-geojson/blob/master/TileLayer.GeoJSON.js
// Load data tiles from an AJAX data source
L.TileLayer.Ajax = L.TileLayer.extend({
    _requests: [],

    _xhrHandler: function (req, layer, tile, tilePoint) {
        return function () {
            if (req.readyState !== 4) {
                return;
            }
            var s = req.status;
            if ((s >= 200 && s < 300) || s === 304) {
                tile.datum = JSON.parse(req.responseText);
                layer._tileLoaded(tile, tilePoint);
            } else {
                layer._tileLoaded(tile, tilePoint);
            }
        };
    },

    // Load the requested tile via AJAX
    _loadTile: function (tile, tilePoint) {
        var layer = this;
        var req = new XMLHttpRequest();
        this._requests.push(req);
        req.onreadystatechange = this._xhrHandler(req, layer, tile, tilePoint);
        req.open('GET', this.getTileUrl(tilePoint), true);
        req.send();
    },

    _reset: function () {
        L.TileLayer.prototype._reset.apply(this, arguments);
        for (var i = 0; i < this._requests.length; i++) {
            this._requests[i].abort();
        }
        this._requests = [];
    },

    _update: function () {
        if (this._map && this._map._panTransition && this._map._panTransition._inProgress) { return; }
        if (this._tilesToLoad < 0) { this._tilesToLoad = 0; }
        L.TileLayer.prototype._update.apply(this, arguments);
    }
});


L.TileLayer.GeoJSON = L.TileLayer.Ajax.extend({
    options : {
        rendererFactory: L.svg.tile
    },

    createTile: function (coords, done) {
        var renderer = this.options.rendererFactory(this.getTileSize(), this.options, coords);
            renderer._initClipPath(coords.x, coords.y, coords.z);
        var tile = document.createElement('svg', 'leaflet-tile'),
            size = this.getTileSize();
            tile.width = size.x;
            tile.height = size.y;
            tile.processed = false;
            tile.datum = false;
            tile.renderer = renderer;
        this._tiles[coords.x + ':' + coords.y + ':' + coords.z] = tile;
        this._loadTile(tile, coords);

        L.DomEvent.on(tile, 'load', L.bind(this._tileOnLoad, this, done, tile));
        L.DomEvent.on(tile, 'error', L.bind(this._tileOnError, this, done, tile));

        L.Util.requestAnimFrame(done.bind(coords, null, null));
        return renderer.getContainer();
    },

    renderTile : function (tile, coords, done) {
        var renderer = tile.renderer,
            unitsPerTile = this._map.options.crs.options.resolutions[coords.z] * this.getTileSize().x
            geojson = tile.datum;
        for (var i in geojson.features) {
            var feat = geojson.features[i],
                geomType = feat.geometry.type;
            if (geomType != 'GeometryCollection') {
                this._renderFeature(renderer, feat, coords, unitsPerTile);
            } else {
                var geometries = feat.geometry.geometries;
                for (var i in geometries) {
                    var featPart = Object.create(feat);
                    featPart.properties = feat.properties;
                    featPart.type = "Feature"
                    featPart.id = feat.id,
                    geometry = geometries[i],
                    featPart.geometry = geometry;
                    this._renderFeature(renderer, featPart, coords, unitsPerTile);
                }
            }
        }
        var resizeValue = renderer._getContainerResize();
        if (resizeValue && resizeValue < 0) {
            // make some corrections to the underlying svg as per marker icons
            // resizeValue should always be negative (how many px hidden).
            var anchor = L.point(resizeValue, resizeValue);
            tilePosition = L.DomUtil.getPosition(renderer._container).add(anchor);
            resizeWidth = 2 * resizeValue,
            resizeHeight = 2 * resizeValue;
            renderer._container.style['width'] = (renderer._size.x  - resizeWidth) +'px';
            renderer._container.style['height'] = (renderer._size.y - resizeHeight) +'px';
            renderer._container.setAttribute(
                'viewBox',
                [0 + anchor.x, 0 + anchor.y, renderer._size.x - resizeHeight, renderer._size.y - resizeWidth].join(' '));
            L.DomUtil.setTransform(renderer._container, tilePosition);
        }
    },

    _renderFeature(renderer, feature, coords, unitsPerTile) {
        var style = this.geojsonOptions.style || L.Path.prototype.options,
            feat = feature,
            geomType = feat.geometry.type,
            isClosed = ['Polygon', 'MultiPolygon'].indexOf(geomType) >= 0 ? true : false,
            isMulti = geomType.indexOf('Multi') == 0 ? true : false,
            clipPathId = renderer._clipPathId;
        if (isMulti == false) {
            this._mkFeatureParts(feat, unitsPerTile, coords);
            this._mkFeatureOptions(feat, style);
            if (geomType != 'Point') {
                renderer._initPath(feat);
                renderer._updateStyle(feat);
                renderer._updatePoly(feat, isClosed);
                renderer._addPath(feat);
            } else {
                renderer._initIcon(feat);
                renderer._updateIconStyle(feat);
                renderer._addIcon(feat);
            }
            feat._path.setAttribute('pointer-events', 'all');
            feat._path.setAttribute('id', this.options.unique(feat));
            this._cachePath(feat, this.options.unique);
            var _paths = this._paths,
                geomType = feat.geometry.type.replace('Multi', ''),
                hoverClassNamePrefix = this.options.hoverClassNamePrefix,
                _hoverClassName = hoverClassNamePrefix !== undefined ? hoverClassNamePrefix + "-" + feat.geometry.type : undefined,
                layer = this,
                path = feat._path,
                geojsonOptions = this.geojsonOptions;
            this.addInteractiveTarget(path);
            if (geojsonOptions && geojsonOptions.onEachFeature) {
                this.geojsonOptions.onEachFeature(feat, path, renderer);
            }
            path.addEventListener('mouseover', function(e) {
                if (_hoverClassName !== undefined) {
                    var target = e.target,
                        id = target.id,
                        paths = _paths[id];
                    for (var i in paths) {
                        var cpath = paths[i];
                        if (!L.DomUtil.hasClass(cpath._path, _hoverClassName)) {
                            L.DomUtil.addClass(cpath._path, _hoverClassName);
                        }
                    }
                }
            }, false);
            path.addEventListener('mouseout', function(e) {
                if (_hoverClassName !== undefined) {
                    var id = e.target.id,
                        paths = _paths[id];
                    for (var i in paths) {
                        var cpath = paths[i];
                        if (L.DomUtil.hasClass(cpath._path, _hoverClassName)) {
                            L.DomUtil.removeClass(cpath._path, _hoverClassName);
                        }
                    }
                }
            }, false);
        } else {
            // If it's a multitype, render as separate features
            for (var i = 0; i < feat.geometry.coordinates.length; i++) {
                var featPart = Object.create(feat),
                    geomType = feat.geometry.type.replace('Multi', '');
                featPart.geometry = {"type": geomType, coordinates:[]};
                featPart.properties = feat.properties;
                featPart.type = "Feature";
                featPart.id = feat.id;
                var coordinates = feat.geometry.coordinates[i];
                featPart.geometry.coordinates = coordinates;
                this._renderFeature(renderer, featPart, coords, unitsPerTile);
            }
        }
    },

    _cachePath(feat, fn) {
        var id = fn(feat);
        if (id in this._paths) {
            this._paths[id].push(feat);
        } else {
            this._paths[id] = [feat];
        }
    },

    _mkFeatureParts: function(feat, unitsPerTile, coords) {
        var rings = feat.geometry.coordinates,
            geomType = feat.geometry.type;
        feat._parts = [];
        if (geomType == 'Polygon') {
             for (var i in rings) {
                var ring = rings[i],
                    part = [];
                for (var j in ring) {
                    this._getCoords(ring[j], part, coords, unitsPerTile);
                }
                if (part.length > 0) {
                    feat._parts.push(part);
                }
            }
        } else if (geomType == 'LineString') {
            var part = [];
            for (var i in rings) {
                var ring = rings[i];
                this._getCoords(ring, part, coords, unitsPerTile);
                if (part.length > 0) {
                    feat._parts.push(part);
                }
            }
        } else if (geomType == 'Point') {
            var part = [];
            this._getCoords(rings, part, coords, unitsPerTile);
            if (part.length > 0) {
                feat._parts.push(part);
            }
        }
    },

    _getCoords: function(ring, part, coords, unitsPerTile) {
        try {
            var dx = coords.x * unitsPerTile,
                dy = coords.y * unitsPerTile,
                point = L.point(ring[0] - dx, ring[1] + dy),
                ltlng = this._map.options.crs.projection.unproject(point),
                tilePnt = this._map.options.crs.latLngToPoint(ltlng, coords.z);
            part.push(tilePnt);
        } catch (e) {
            console.log(ring, coords);
            throw(e);
        }
    },

    _mkFeatureOptions: function (feat, style) {
        if (typeof(style) === 'function') {
            var style = style(feat, this);
        }
        var styleDef = L.extend({}, style);
        if (feat.geometry.type == 'Polygon') {
            styleDef.fill = true;
            styleDef.stroke = true;
        } else if (feat.geometry.type == 'LineString'){
            styleDef.fill = false;
            styleDef.stroke = true;
        }
        feat.options = styleDef;
        feat.options.pointerEvents = "all";
        feat.options.clickable = true;
        feat.options.interactive = true;
    },

    initialize: function (url, options, geojsonOptions) {
        L.TileLayer.Ajax.prototype.initialize.call(this, url, options);
        this.geojsonOptions = geojsonOptions || {};
        this.datum = null;
        this._paths = {};
    },
    onAdd: function (map) {
        this._map = map;
        L.TileLayer.Ajax.prototype.onAdd.call(this, map);
    },
    onRemove: function (map) {
        L.TileLayer.Ajax.prototype.onRemove.call(this, map);
    },

    _tileLoaded: function (tile, tilePoint, done) {
        if (tile.datum === null) { return null; }
        this.renderTile(tile, tilePoint, done);
    }
});

L.tileLayer.geoJson = function(urlTemplate, options, geojsonOptions) {
    return new L.TileLayer.GeoJSON(urlTemplate, options, geojsonOptions);
}

L.GeoJSON.URL = L.GeoJSON.extend({
    initialize: function(url, options) {
        var cls = this;
        // hello! hello! is this thing on?
        // pole päris kindel, et see nii peaks toimuma, aga ... :D
        this.get(url).then(function(data){
            L.GeoJSON.prototype.initialize.call(cls, data, options);
        }, function(error) {
            console.error(error);
        });
    },
    get: function(url) {
        return new Promise(function(resolve, reject) {
            fetch(url)
                .then(function(response) {
                    if (response.ok) {
                        return response.json();
                    }
                    reject(Error(
                        L.Util.template(
                            'GET {url} returned HTTP {status} ({statusText})',
                            response
                        )
                    ));
                }).then(function(data) {
                    resolve(data);
                });
        });
    },
    _setLayerStyle: function(layer, style) {
        if (typeof style === 'function') {
            style = style(layer.feature, layer.options.styleDescriptor);
        }
        if (layer.setStyle) {
            layer.setStyle(style);
        }
    },
    getAttribution: function() {
        return this.options.attribution;
    }
});

L.geoJSON.url = function(url, options) {
    return new L.GeoJSON.URL(url, options);
}

var _thematicLayers = {
    "geojson.tile": {
        "constructor": L.tileLayer.geoJson,
        "options": {
            "unique": function (feature) {
                return feature.id;
            }
        },
        "typeOptions": {
            "onEachFeature": function (feature, layers, tile) {
                return feature;
            },
            "style": function(feature, layer) {
                var style = layer.options.styleDescriptor;
                if (style.type == "default") {
                    return style.values;
                } else if (style.type == "classify") {
                    var key = style.key,
                        val = feature.properties[key];
                    return style.values[val] || {};
                }
                return {};
            }
        }
    },
    "geojson.url": {
        "constructor": L.geoJSON.url,
        "options": {
            "style": function(feature, style) {
                if (style.type == "default") {
                    return style.values;
                } else if (style.type == "classify") {
                    var key = style.key,
                        val = feature.properties[key];
                    return style.values[val] || {};
                }
                return {};
            },
            "onEachFeature": function(feature, layer) {
                // @TODO: L.TileLayer.GeoJSON toimub see `hover` klassinime
                // lisamine mujal. liiguta siit ka see välja!
                if (layer.options.hoverClassNamePrefix) {
                    var geomType = feature.geometry.type.replace('Multi', ''),
                        _hoverClassName = layer.options.hoverClassNamePrefix + "-" + geomType;
                    layer.on('mouseover', function(e) {
                        var _layer = e.target,
                            _path = _layer._path;
                        if (!L.DomUtil.hasClass(_path, _hoverClassName)) {
                            L.DomUtil.addClass(_path, _hoverClassName);
                        }
                    });
                    layer.on('mouseout', function(e) {
                        var _layer = e.target,
                            _path = _layer._path;
                        if (L.DomUtil.hasClass(_path, _hoverClassName)) {
                            L.DomUtil.removeClass(_path, _hoverClassName);
                        }
                    });
                }
            }
        }
    }
};

function initThematics(themas) {
    themas.forEach(function(thema) {
        try {
            initThematicLayer(thema);
        } catch (err) {
            console.error(err);
        }
    });
}

function initThematicLayer(thema) {
    var urlTemplate = thema.url,
        type = thema.type,
        layername = thema.layername,
        isVisible = thema.isVisible !== undefined ? thema.isVisible : false,
        minZoom = thema.minZoom !== undefined ? thema.minZoom : map.getMinZoom(),
        maxZoom = thema.maxZoom !== undefined ? thema.maxZoom : map.getMaxZoom(),
        attribution = thema.attribution !== undefined ? thema.attribution : '',
        hoverClassNamePrefix = thema.hover == true ? 'hover' : undefined,
        style = Object.assign({}, thema.style),
        constr = _thematicLayers[type]["constructor"],
        opts = Object.assign({}, _thematicLayers[type]["options"]),
        typeOpts = Object.assign({}, _thematicLayers[type]["typeOptions"]);
    if (constr === undefined) {
        throw ("Undefined thematic layer type: ", type);
    }
    opts.minZoom = minZoom;
    opts.maxZoom = maxZoom;
    if (attribution !== '') {
        opts.attribution = attribution;
    }
    if (hoverClassNamePrefix !== undefined) {
        // see võiks olla tegelikult kasutaja juhitav, saab cssis määrata
        // midagi muud kujunduseks kui meie default.
        opts.hoverClassNamePrefix = hoverClassNamePrefix;
    }
    if (style !== undefined) {
        opts.styleDescriptor = style;
    }

    var _layer = constr(urlTemplate, opts, typeOpts);
    if (isVisible === true) {
        _layer.addTo(map);
    }
    layerControl.addOverlay(_layer, layername);
}
