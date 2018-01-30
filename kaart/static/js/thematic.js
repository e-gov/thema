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

    _initClipPath: function(tileX, tileY, tileZ) {
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
        layer._path.setAttribute('clip-path', 'url(#' + this._clipPathId + ')')
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

        /** IE11 teema: punktobjektid kuvatakse valesse kohta, vt
            https://github.com/e-gov/thema/issues/35
        */
        if (L.Browser.ie3d) {
            icon.setAttribute("transform", "translate(" + loc.x + " " + loc.y + ")");
        }
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
            return Math.min(minx, miny, maxx, maxy);
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

    _xhrHandler: function (req, tile) {
        return function () {
            if (req.readyState !== 4) {
                return;
            }
            var s = req.status;
            if ((s >= 200 && s < 300) || s === 304) {
                tile.datum = JSON.parse(req.responseText);
                tile.renderer.fire('tileload');
            } else {
                tile.datum = false;
                tile.renderer.fire('tileerror');
            }
        };
    },

    // Load the requested tile via AJAX
    _loadTile: function (tile) {
        var req = new XMLHttpRequest();
        this._requests.push(req);
        req.onreadystatechange = this._xhrHandler(req, tile);
        req.open('GET', this.getTileUrl(tile.tilePoint), true);
        req.send();
    },

    _reset: function () {
        //L.TileLayer.prototype._reset.apply(this, arguments);
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
    marked : [],

    createTile: function (coords, done) {
        var renderer = this.options.rendererFactory(this.getTileSize(), this.options, coords);
        renderer._initClipPath(coords.x, coords.y, coords.z);
        var tile = document.createElement('svg', 'leaflet-tile'),
            size = this.getTileSize();
        tile.width = size.x;
        tile.height = size.y;
        tile.datum = false;
        tile.renderer = renderer;
        tile.tilePoint = coords;
        tile.crs = this._map.options.crs;
        tile.layer = this;

        L.DomEvent.on(renderer, 'tileload', L.Util.bind(this._tileOnLoad, this, this.renderTile, tile));
        L.DomEvent.on(renderer, 'tileerror', L.Util.bind(this._tileOnError, this, done, tile));

        L.Util.requestAnimFrame(done.bind(coords, null, null));
        this._loadTile(tile);
        return renderer.getContainer();
    },

    renderTile : function (tile) {
        var renderer = tile.renderer,
            coords = tile.tilePoint,
            unitsPerTile = tile.crs.options.resolutions[coords.z] * tile.width,
            geojson = tile.datum;
        for (var i in geojson.features) {
            var feat = geojson.features[i],
                geomType = feat.geometry.type;
            if (geomType != 'GeometryCollection') {
                tile.layer._renderFeature(renderer, feat, coords, unitsPerTile);
            } else {
                var geometries = feat.geometry.geometries;
                for (var i in geometries) {
                    var featPart = Object.create(feat);
                    featPart.properties = feat.properties;
                    featPart.type = "Feature"
                    featPart.id = feat.id,
                    geometry = geometries[i],
                    featPart.geometry = geometry;
                    tile.layer._renderFeature(renderer, featPart, coords, unitsPerTile);
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
        return tile;
    },
    _roundPrecision: function(z) {
        // See on liiga häkk!!
        var tolerances = [3,3,3,3,4,4,5,5,6];
        return tolerances[z];
    },

    _markFeature: function(layerId, featureId) {
        var featureMarker,
            z = this._map.getZoom(),
            precision = this._roundPrecision(z),
            layers = this._layers[featureId],
            layer = layers[0],
            geomType = layer.feature.geometry.type;

        if (geomType != 'Point') {
            // LineString/Polygon võivad paikneda
            // mitmel erineval kahhlil ja olla ka ülekattega.
            // lisaks on siin läbi käimata, mis saab juhul kui jooned...
            var unioned,
                features = [];
            for (var i=0;i<layers.length;i++) {
                layer = layers[i];
                var feature = turf.clone(layer.feature);
                features.push(feature);
            }
            //console.log(JSON.stringify(features));
            var fc = turf.featureCollection(features),
                unioned;
            turf.featureEach(fc, function(currentFeature, featureIdx) {
                turf.truncate(currentFeature, {precision:precision, mutate:true});
                turf.cleanCoords(currentFeature, {mutate:true});
                var rings = [],
                    ring = [],
                    previousGeomIdx = 0;
                turf.coordEach(currentFeature, function (
                    currentCoord, coordIndex, featureIndex, multiFeatureIndex,
                    geometryIndex) {
                        if (previousGeomIdx != geometryIndex) {
                            if (ring.length > 3) {
                                rings.push(ring);
                            }
                            ring = [];
                            previousGeomIdx = geometryIndex;
                        }
                        // enne currentCoord ringi pushimist tuleks
                        // kontrollida, et sellist koordinaatpaari siin kettas
                        // juba ei oleks. Lihtsustamise tõttu võib juhtuda.
                        ring.push(currentCoord);
                    }
                );

                // lisame viimase läbikäidud ketta ka
                if (ring.length > 3) {
                    rings.push(ring);
                }

                if (rings.length > 0) {
                    currentFeature.geometry.coordinates = rings;
                    fc.features[featureIdx] = turf.buffer(currentFeature, 0, {units:'meters'});
                } else {
                    fc.features[featureIdx] = null;
                }
            });

            turf.rewind(fc, {mutate:true});
            var unioned;

            turf.featureEach(fc, function(currentFeature, featureIdx) {
                if (!currentFeature) {
                    return;
                }
                var kinks = turf.kinks(currentFeature);
                if (kinks.features.length > 0) {
                    var unkinked = turf.unkinkPolygon(currentFeature),
                        lines = [];
                    turf.featureEach(unkinked, function(cur, idx) {
                        var line = turf.polygonToLine(cur)
                        lines.push(line);
                    });
                    var linework = turf.combine(turf.featureCollection(lines));
                    currentFeature = turf.buffer(turf.lineToPolygon(linework), 0, {units:'meters'});
                }
                if (!unioned) {
                    unioned = currentFeature;
                } else {
                    try {
                        unioned = turf.union(unioned, currentFeature);
                    } catch (e) {
                        console.log('PREV', JSON.stringify(unioned));
                        console.log('CURR', JSON.stringify(currentFeature));
                        throw(e);
                    }
                }
            });

            if (unioned) {
                turf.rewind(unioned, {mutate: true})
                featureMarker = L.geoJson(unioned, {
                    layerId: layerId,
                    featureId: featureId,
                    interactive:false,
                    className:"clicked"
                });
            }

        } else {
            // siin on arvutustel mingi probl kui ikooni iconAnchor pole täpselt
            // ikooni keskel.
            var width = Number(layer._path.getAttribute("width")),
                height = Number(layer._path.getAttribute("height")),
                radius = width >= height ? width/2 + 5 : height/2 + 5,
                iconAnchor = layer.options.iconAnchor,
                coordinates = layer.feature.geometry.coordinates,
                pnt = this._map.latLngToLayerPoint(L.latLng(coordinates[1], coordinates[0])),
                anchored = pnt.add(L.point(width / 2, height / 2).add(L.point(iconAnchor))),
                anchoredLatLng = this._map.layerPointToLatLng(anchored);

            featureMarker = L.circleMarker(anchoredLatLng, {
                featureId: featureId,
                layerId: layerId,
                radius:radius,
                interactive:false,
                className:"clicked"
            });
            featureMarker.feature = layer.feature;
        }
        // enne markeeringu lisamist, laseme vana maha:
        this._clearMarked(layerId);

        this.marked.push(featureMarker);
        featureMarker.addTo(this._map);
        featureMarker.off('mouseover');
    },

    _clearMarked: function(layerId) {
        for (var i=0; i < this.marked.length; i++) {
            var featureMarker = this.marked[i];
            featureMarker.removeFrom(this._map);
        }
        this.marked = [];
    },

    _renderFeature: function(renderer, feature, coords, unitsPerTile) {
        var options = this.options,
            geomType = feature.geometry.type,
            isClosed = ['Polygon', 'MultiPolygon'].indexOf(geomType) >= 0 ? true : false,
            isMulti = geomType.indexOf('Multi') == 0 ? true : false,
            clipPathId = renderer._clipPathId;

        if (options.filter) {
            if (!options.filter(feature)) {
                return;
            }
        }

        if (isMulti == false) {
            var F = L.Class.extend({}),
                _layer = new F(),
                joins = options.joins;
            _layer.tilePoint = coords;
            if (joins) {
                // Merge seosed.
                Object.keys(joins).forEach(function(key) {
                    var j = joins[key],
                        values = j.getValueFor(feature.properties[key]),
                        fields = j.options.fields || [];
                    for (var i=0;i<fields.length;i++) {
                        var joinField = fields[i],
                            joinKey = key + '__'+ j.options.id + '__' + joinField;
                        feature.properties[joinKey] = values[joinField];
                    }
                });
            }
            _layer.feature = feature;
            this._mkFeatureParts(_layer, unitsPerTile, coords)
            this._mkFeatureOptions(_layer, options);

            if (geomType != 'Point') {
                renderer._initPath(_layer);
                renderer._updateStyle(_layer);
                renderer._updatePoly(_layer, isClosed);
                renderer._addPath(_layer);
            } else {
                renderer._initIcon(_layer);
                renderer._updateIconStyle(_layer);
                renderer._addIcon(_layer);
            }

            var id = this._cacheLayer(_layer, options.unique);
            _layer._path.setAttribute('pointer-events', 'all');
            _layer._path.setAttribute('id', id);

            this.addInteractiveTarget(_layer);

            if (options && options.onEachFeature) {
                this.options.onEachFeature(feature, _layer._path, renderer);
            }

            this.attachInteraction(_layer);
        } else {
            // If it's a multitype, render as separate features
            for (var i = 0; i < feature.geometry.coordinates.length; i++) {
                var featPart = Object.create(feature),
                    geomType = feature.geometry.type.replace('Multi', '');
                featPart.geometry = {"type": geomType, coordinates:[]};
                featPart.properties = feature.properties;
                featPart.type = "Feature";
                featPart.id = feature.id;
                var coordinates = feature.geometry.coordinates[i];
                featPart.geometry.coordinates = coordinates;
                this._renderFeature(renderer, featPart, coords, unitsPerTile);
            }
        }
    },

    attachInteraction: function(layer) {
        var options = this.options,
            hoverClassNamePrefix = options.hoverClassNamePrefix,
            feature = layer.feature,
            geomType = feature.geometry.type,
            _hoverClassName = hoverClassNamePrefix !== undefined ? hoverClassNamePrefix + "-" + geomType : undefined;

        L.DomEvent.on(
            layer._path, 'mouseover', L.Util.bind(
                function(layer) {
                    var feature = layer.feature;
                    if (layer.options.info) {
                        layer.options.info.update(
                            feature.properties,
                            layer.options.layername
                        );
                    }
                    if (_hoverClassName) {
                        var id = layer.options.unique(feature),
                            paths = this._layers[id];
                        for (var i in paths) {
                            var cpath = paths[i];
                            if (!L.DomUtil.hasClass(cpath._path, _hoverClassName)) {
                                L.DomUtil.addClass(cpath._path, _hoverClassName);
                            }
                        }
                    }
                }, this, layer));

        L.DomEvent.on(
            layer._path, 'mouseout', L.Util.bind(
                function(layer) {
                    var feature = layer.feature,
                        id = layer.options.unique(feature),
                        paths = this._layers[id];
                    if (layer.options && layer.options.info) {
                        layer.options.info.update();
                    }
                    for (var i in paths) {
                        var cpath = paths[i];
                        if (L.DomUtil.hasClass(cpath._path, _hoverClassName)) {
                            L.DomUtil.removeClass(cpath._path, _hoverClassName);
                        }
                    }
                }, this, layer));
        L.DomEvent.on(
            layer._path, 'click', L.Util.bind(
                function(e) {
                    if (layer.options && layer.options.info) {
                        L.DomEvent.stop(e);// don't propagate to map underneath
                        var marked = this.marked[0],
                            layerId = L.Util.stamp(this),
                            featureId = e.target.attributes.id.value,
                            markMe = this.options.hoverClassNamePrefix !== undefined ? true : false;
                        if (!markMe) {
                            return;
                        }
                        if (!marked || featureId != marked.options.featureId) {
                            layer.options.info.freeze(layer);
                            this._markFeature(layerId, featureId);
                        } else {
                            layer.options.info.unfreeze();
                            this._clearMarked(layerId);
                        }
                    }
                }, this
            )
        );
    },

    _cacheLayer: function(layer, fn) {
        var id = fn(layer.feature);
        if (id in this._layers) {
            this._layers[id].push(layer);
        } else {
            this._layers[id] = [layer];
        }
        this.fire('cacheAdd', {featureId:id, layerId:L.Util.stamp(this)});
        return id;
    },

    _mkFeatureParts: function(layer, unitsPerTile, coords) {
        var feature = layer.feature,
            rings = feature.geometry.coordinates,
            geomType = feature.geometry.type,
            parts = layer._parts = [];
        if (geomType == 'Polygon') {
             for (var i in rings) {
                var ring = rings[i],
                    part = [];
                for (var j in ring) {
                    var _ring = [];
                    this._getCoords(ring[j], _ring, part, coords, unitsPerTile);
                    ring[j] = _ring;
                }
                if (part.length > 0) {
                    parts.push(part);
                }
            }
        } else if (geomType == 'LineString') {
            var part = [];
            for (var i in rings) {
                var ring = rings[i],
                    _ring = [];
                this._getCoords(ring, _ring, part, coords, unitsPerTile);
                ring[i] = _ring;
                if (part.length > 0) {
                    parts.push(part);
                }
            }
        } else if (geomType == 'Point') {
            var part = [],
                _ring = [];
            this._getCoords(rings, _ring, part, coords, unitsPerTile);
            feature.geometry.coordinates = _ring;
            if (part.length > 0) {
                parts.push(part);
            }
        }
        turf.rewind(layer.feature, {mutate:true});
    },

    _getCoords: function(ring, _ring, part, coords, unitsPerTile) {
        try {
            var dx = coords.x * unitsPerTile,
                dy = coords.y * unitsPerTile,
                point = L.point(ring[0] - dx, ring[1] + dy),
                trueLatLng = this._map.options.crs.projection.unproject(L.point(ring)),
                ltlng = this._map.options.crs.projection.unproject(point);
            var tilePnt = this._map.options.crs.latLngToPoint(ltlng, coords.z);
            part.push(tilePnt);
            _ring.push(trueLatLng.lng);
            _ring.push(trueLatLng.lat);
        } catch (e) {
            console.log(ring, coords);
            throw(e);
        }
    },

    _mkFeatureOptions: function (layer, options) {
        var feature = layer.feature,
            geomType = feature.geometry.type,
            opts = L.extend({}, options),
            style = opts.style || L.Path.prototype.options;
        if (typeof(style) === 'function') {
            var style = style(feature, this);
        }
        var styleDef = L.extend(opts, style);
        if (geomType == 'Polygon') {
            styleDef.fill = true;
            styleDef.stroke = true;
        } else if (geomType == 'LineString'){
            styleDef.fill = false;
            styleDef.stroke = true;
        }
        styleDef.pointerEvents = "all";
        styleDef.clickable = true;
        styleDef.interactive = true;
        layer.options = styleDef;
    },

    initialize: function (url, options) {
        L.TileLayer.Ajax.prototype.initialize.call(this, url, options);
        this.datum = null;
        this._layers = {};
        this.hasLoaded = false;

        L.DomEvent.on(this, 'tileload', function(e) {
            this.hasLoaded = false;
        })

        L.DomEvent.on(this, 'load', function(e) {
            this.hasLoaded = true;
        });

        L.DomEvent.on(this, 'cacheAdd', function(e) {
            if (this.hasLoaded == true) {
                var marked = this.marked[0],
                    featureId = e.featureId,
                    layerId = e.layerId;
                if (marked && marked.options.featureId == featureId) {
                    this._markFeature(layerId, featureId);
                }
            }
        });

        L.DomEvent.on(this, 'cacheUnload', function(e) {
            //this._clearMarked();
            //this._map.closeInfo();
        })
    },
    onAdd: function (map) {
        this._map = map;
        L.TileLayer.Ajax.prototype.onAdd.call(this, map);
        map.on('zoomstart', this._onZoom, this);
    },
    onRemove: function (map) {
        map.off('zoomstart', this._onZoom, this);
        L.TileLayer.Ajax.prototype.onRemove.call(this, map);
    },
    _onZoom: function(e) {
        // canceldame pooleliolevad requestid
        this._reset();
        // tühjendame viimasel zoomil kogutud cache'i
        this._layers = {};
        // ja anname teada, et cache on tühjaks lastud
        this.fire('cacheUnload');
    },
    _tileOnLoad: function (done, tile) {
        if (tile.datum === null) { return null; }
        done(tile);
    },

    _tileOnError: function(done, tile, error) {
        done(error, tile);
    }
});

L.tileLayer.geoJson = function(urlTemplate, options) {
    return new L.TileLayer.GeoJSON(urlTemplate, options);
}

L.HeatmapOverlay = HeatmapOverlay.include({
    options: {
        pane: 'heatPane'
    },
    onAdd: function(map) {
        var size = map.getSize();

        this._map = map;

        this._width = size.x;
        this._height = size.y;

        this._el.style.width = size.x + 'px';
        this._el.style.height = size.y + 'px';
        this._el.style.position = 'absolute';

        this._origin = this._map.layerPointToLatLng(new L.Point(0, 0));

        this.getPane().appendChild(this._el);

        if (!this._heatmap) {
          this._heatmap = h337.create(this.cfg);
        }

        // this resets the origin and redraws whenever
        // the zoom changed or the map has been moved
        map.on('moveend', this._reset, this);
        map.on('zoomstart', this._hide, this);
        map.on('zoomend', this._show, this);
        this._draw();
    },
    onRemove: function (map) {
      // remove layer's DOM elements and listeners
      this.getPane().removeChild(this._el);

      map.off('moveend', this._reset, this);
      map.off('zoomstart', this._hide, this);
      map.off('zoomend', this._show, this);
    },
    _hide: function() {
        if (!this._el) {
            return;
        }
        // et pilt ei jääks sissezoomi ajaks ripnema
        this._el.style.visibility = 'hidden';
        return this;
    },
    _show: function(e) {
        if (!this._el) {
            return;
        }
        // juhul kui min/max z lubab, siis näitame pilti jälle
        var zoom = this._map.getZoom(),
            minZoom = this.cfg.minZoom || this._map.getMinZoom(),
            maxZoom = this.cfg.maxZoom || this._map.getMaxZoom();
        if (minZoom <= zoom && maxZoom >= zoom) {
            this._el.style.visibility = 'visible';
        }
        return this;
    }
});

L.heatmapOverlay = function(urlTemplate, options) {
    return new L.HeatmapOverlay(options);
}

L.GeoJSON.URL = L.GeoJSON.extend({
    setUpLayer: function(data, options) {
        if (options.styleDescriptor && options.styleDescriptor.type == 'heatmap') {
            var style = options.styleDescriptor
            L.Util.setOptions(this, options);
            this._drawHeatmap(data, style);
        } else if (options.styleDescriptor && options.styleDescriptor.type == 'hex') {
            var style = options.styleDescriptor;
            L.Util.setOptions(this, options);
            var cls = this;
            this.drawGrid(data, style).then(
                function(gridded)  {
                    L.GeoJSON.prototype.initialize.call(cls, gridded, options);
                    return gridded;
                }
            );
        } else {
            L.GeoJSON.prototype.initialize.call(this, data, options);
        }
        this.marked = [];
    },

    initialize: function(url, options) {
        var cls = this;
        this.get(url).then(function(data){
            if (!options.join) {
                cls.setUpLayer(data, options);
            } else {
                L.Util.setOptions(cls, options);
                cls.data = {};
                var key = cls.options.key,
                    fields = cls.options.fields;
                for (var i=0; i < data.features.length; i++) {
                    var f = data.features[i],
                        idx = f.properties[key],
                        rval = {};
                    for (var j=0; j<fields.length; j++) {
                        var field = fields[j]
                        rval[field] = f.properties[field];
                    }
                    cls.data[idx] = rval;
                }
            }
            cls.fire('loaded');
        }, function(error) {
            cls.fire('loaderror');
            console.error(error);
        });
    },
    onAdd: function(map) {
        L.GeoJSON.prototype.onAdd.call(this, map);
        this._map.on('zoomend', this._showHide, this);
        if (this._heatCanvas) {
            map.addLayer(this._heatCanvas);
        }
    },
    onRemove: function() {
        L.GeoJSON.prototype.onRemove.call(this, map);
        this._map.off('zoomend', this._showHide, this);
        if (this._heatCanvas) {
            map.removeLayer(this._heatCanvas);
        }
    },
    _showHide: function(e) {
        var zoom = this._map.getZoom(),
            minZoom = this.options.minZoom,
            maxZoom = this.options.maxZoom,
            renderer = this._map.getRenderer(this);
        if (zoom > maxZoom || zoom < minZoom) {
            if (renderer && renderer._container) {
                renderer._container.style.visibility = 'hidden';
            }
        } else {
            if (renderer && renderer._container) {
                renderer._container.style.visibility = 'visible';
            }
        }
    },
    get: function(url) {
        return fetch(url)
            .then(function(response) {
                if (response.ok) {
                    return response.json();
                }
                return Promise.reject(Error(
                    L.Util.template(
                        'GET {url} returned HTTP {status} ({statusText})',
                        response
                    )
                ));
            })
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
    },
    getValueFor: function(val) {
        if (!this.data) {return {}};
        return this.data[val];
    },
    _clearMarked: function(layerId) {
        var marked = this.marked || [];
        for (var i=0; i < marked.length; i++) {
            var featureMarker = marked[i];
            featureMarker.removeFrom(this._map);
        }
        this.marked = [];
    },
    _getHeatmapCanvas: function(style) {
        if (!this._heatCanvas) {
            var config = {
                gradient: style.gradient,
                radius: style.radius || 3,
                maxOpacity: style.maxOpacity || 0.8,
                scaleRadius:style.scaleRadius || true,
                useLocalExtrema:style.useLocalExtrema || false,
                latField:"lat",
                lngField:"lng",
                valueField:"count",
                minZoom: this.options.minZoom,
                maxZoom: this.options.maxZoom
            };
            var hCanvas = this._heatCanvas = L.heatmapOverlay(null, config);
            this._attachInteraction(hCanvas);
            if (this._map) {
                hCanvas.addTo(this._map);
            }
        }
        return this._heatCanvas;
    },

    _drawHeatmap: function(data, style) {

        var hm = this._getHeatmapCanvas(style.values),
            features = [],
            key = style.key || "count",
            max = style.max || 1,
            min = style.min || 0;

        data.features.filter(function(feature) {
            return feature.geometry.type == 'Point' && feature.properties[key] >= min
        }).forEach(function(feature) {
            features.push({
                lng:feature.geometry.coordinates[0],
                lat:feature.geometry.coordinates[1],
                count:feature.properties[key]
            });
        });
        hm.setData({max:max, min:min, data:features});
    },
    _attachInteraction: function(hCanvas) {
        // see on tehtav, kuid tulemus on kaheldav..
        // pigem võiks value asemel näidata infoaknas hoopis legendi??
//        hCanvas._el.onmousemove = function(e) {
//            var x = e.layerX,
//                y = e.layerY,
//                value = hCanvas._heatmap.getValueAt({x:x, y:y});
//            console.log(value);
//        };
    }
});

L.GeoJSON.URL.include({
    drawGrid: function(data, style) {
        var key = style.key,
            cls = this;
        return new Promise(function(resolve, reject) {
            cls.classify(data, style)
                .then(
                    function(response) {
                        var data = response.data,
                            style = response.style,
                            clskey = response.clskey;
                        return cls.downSample(data, style, clskey);
                    }
                )
                .then(
                    function(response) {
                        var data = response.data,
                            style = response.style,
                            cellSize = style.cellSize,
                            weight = style.idwWeight,
                            key = style.key,
                            type = style.type,
                            grid = turf.interpolate(
                                data,
                                cellSize,
                                {gridType:type, units:'meters', property:key,
                                    weight:weight});
                        // Selle teadmise peaks ka kuskilt saama, kas on vaja.
                        //turf.featureEach(grid, function(feature) {
                        //    feature.properties[key] = Math.round(feature.properties[key] * 100) / 100
                        //});
                        return resolve(grid);
                    }
                );
        });
    },
    classify: function(data, style) {
        return new Promise(function(resolve, reject) {
            var key = style.key,
                clskey = L.Util.template('{key}{suffix}', {key:key, suffix: '_cls'}),
                breaks = style.breaks;
            turf.featureEach(data, function(feature) {
                var cls = -1;
                for (var i=1;i<breaks.length;i++) {
                    var min = breaks[i-1],
                        max = breaks[i];
                    if (feature.properties[key] > min && feature.properties[key] <= max) {
                        cls = i-1;
                    }
                }
                if (cls == -1) {
                   var max = breaks[breaks.length - 1];
                   if (feature.properties[key] > max) {
                       cls = breaks.length - 1
                   }
               }
               feature.properties[clskey] = cls;
            });
            return resolve({data:data, style:style, clskey:clskey});
        });
    },
    downSample: function(data, style, clskey) {
        return new Promise(function(resolve, reject) {
            var features = [],
                filter = {},
                breaks = style.breaks;
            for (var i=0;i<breaks.length;i++) {
                filter[clskey] = i;
                var fc = turf.getCluster(data, filter),
                    clSize = fc.features.length;
                // see peaks olema juhitav - kas tahan sämplimist või mitte.
                if (clSize > 1500) {
                    fc = turf.sample(fc, 1000);
                    clSize = 1000;
                }
                fc = turf.clustersDbscan(
                    fc,
                    20, // võiks sõltuda (nagu ka minPoints) kokku klassis olevate objektide arvust?
                    {units:"kilometers", minPoints:5, mutate:true}
                );
                features.push.apply(features, turf.getCluster(fc, {dbscan:'core'}).features);
                features.push.apply(features, turf.getCluster(fc, {dbscan:'edges'}).features); //??
            }
        return resolve({data:turf.featureCollection(features), style:style});
        });
    }
});

L.geoJSON.url = function(url, options) {
    return new L.GeoJSON.URL(url, options);
}

L.TileLayer.WMS.include({
    "defaultWmsParams": {
        version: '1.1.1',
        transparent: true,
        format: 'image/png',
        styles: '',
        request: 'GetMap',
        service: 'WMS'
    }
});

L.GroupLayer = L.LayerGroup.extend({
    "options": {

    },
    initialize: function(layers, options) {
        L.LayerGroup.prototype.initialize.call(this, layers, options);
    }
});

L.groupLayer = function(fakeurl, options) {
    return new L.GroupLayer(options);
}

var _thematicLayers = {
    "geojson.tile": {
        "constructor": L.tileLayer.geoJson,
        "options": {
            "unique": function (feature) {
                return feature.id;
            },
            "onEachFeature": function (feature, layer, tile) {
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
                } else if (style.type == "heatmap") {
                    return;
                }
                return {};
            },
            "filter": function(feature){
                var constraint = this.constraint
                if (!constraint) {
                    return true;
                }
                var key = constraint.key,
                    val = constraint.value;
                if (feature.properties[key] == val){
                    return true;
                }
                return false;
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
                } else if (style.type == "heatmap") {
                    return;
                } else if (style.type == "hex") {
                    var key = style.key,
                        min = style.min,
                        max = style.max,
                        values = {},
                        val = feature.properties[key];
                        Object.keys(style.values).forEach(function(key) {
                            values[key] = style.values[key];
                        });
                        var ratio = val / (max - min),
                            gradient = values.gradient;
                        var minEnd = Object.keys(gradient).filter(function(v) {
                                return v < ratio
                            }),
                            maxEnd = Object.keys(gradient).filter(function(v) {
                                return v >= ratio
                            }),
                            // eeldame, et gradiendi stopid olid järjekorras 0.1->1.0 järjekorras.
                            minRatio = minEnd[minEnd.length-1],
                            maxRatio = maxEnd[0],
                            minColor = gradient[minRatio] || gradient[maxRatio],
                            maxColor = gradient[maxRatio] || gradient[minRatio],
                            r = ratio / (maxRatio-minRatio) || 1;
                        values.fillColor = minColor == maxColor ? minColor : maxColor.colorGradient(minColor, r);
                    return values;
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
                        if (_layer.options.info !== undefined) {
                            var info = _layer.options.info;
                            info.update(
                                _layer.feature.properties,
                                _layer.options.layername,
                                _layer.options.infoTemplate
                            );
                        }
                    });
                    layer.on('mouseout', function(e) {
                        var _layer = e.target,
                            _path = _layer._path;
                        if (L.DomUtil.hasClass(_path, _hoverClassName)) {
                            L.DomUtil.removeClass(_path, _hoverClassName);
                        }
                        if (_layer.options.info !== undefined) {
                            var info = _layer.options.info;
                            info.update(
                                _layer.feature.properties,
                                _layer.options.layername,
                                _layer.options.infoTemplate
                            );
                        }
                    });
                    layer.on('click', function(e) {
                        var _layer = e.target;
                        if (_layer.options && _layer.options.info) {
                            L.DomEvent.stop(e);// don't propagate to map underneath
                            var markMe = _layer.options.hoverClassNamePrefix !== undefined ? true : false;
                            if (!markMe) {
                                return;
                            }
                        }
                    }, this);
                }
            },
            "filter": function(feature) {
                // TODO
                return true;
            }
        }
    },
    "raster.tile": {
        "constructor": L.tileLayer,
        "options": {

        }
    },
    "raster.url": {
        "constructor": L.tileLayer.wms,
        "options": {

        }
    },
    "grouplayer.tile": {
        "constructor": L.groupLayer,
        "options": {

        }
    }

};

function initThematics(themas) {
    var order = {numLoaded:0};
    for (var z=0;z<themas.length;z++) {
        /* order.numLoaded - kui palju thema-kihte on juba kaardile lisatud.
        *  z - selle konkreetse kihi järjekorranumber.
        */
        var thema = themas[z];
        try {
            initThematicLayer(thema, order, z);
        } catch (err) {
            console.error(err);
        }
    }
    map.on('click', function(e) {
        this.closeInfo();
    });
}

function initLayer(thema, options) {
    var urlTemplate = thema.url,
        type = thema.type,
        constr = _thematicLayers[type]["constructor"],
        layername = thema.layername,
        isVisible = thema.isVisible !== undefined ? thema.isVisible : false,
        minZoom = thema.minZoom !== undefined ? thema.minZoom : map.getMinZoom(),
        maxZoom = thema.maxZoom !== undefined ? thema.maxZoom : map.getMaxZoom(),
        attribution = thema.attribution !== undefined ? thema.attribution : '',
        hoverClassNamePrefix = thema.hover == true ? 'hover' : undefined,
        style = Object.assign({}, thema.style),
        infoTemplate = thema.info,
        graph = Object.assign({}, thema.graph),
        groupname = thema.groupname !== undefined ? thema.groupname : false,
        filterproperty = thema.filterproperty,
        filtervalue = filterproperty && thema.filtervalue !== undefined ? thema.filtervalue : false,
        joins = thema.joins;
    if (constr === undefined) {
        throw ("Undefined thematic layer type: ", type);
    }

    options.minZoom = minZoom;
    options.maxZoom = maxZoom;

    if (infoTemplate !== undefined) {
        options.info = L.control.info({
            "template":infoTemplate,
            "graph":graph
        }).addTo(map);
    }
    if (filterproperty) {
        options.constraint = {
            key: filterproperty,
            value: filtervalue
        };
    }
    if (attribution !== '') {
        options.attribution = attribution;
    }
    if (hoverClassNamePrefix !== undefined) {
        options.hoverClassNamePrefix = hoverClassNamePrefix;
    }
    if (style !== undefined) {
        options.styleDescriptor = style;
    }

    var stillToLoad = 0,
        onJoinsReady = function() {
            return new Promise(function(resolve, reject) {
                var waitForJoins = function () {
                    if (stillToLoad == 0) {
                        resolve();
                    } else {
                        window.requestAnimationFrame(waitForJoins);
                    }
                };
                waitForJoins();
            });
        }

    if (joins) {
        options.joins = {};
        for (var i=0; i<joins.length; i++) {
            stillToLoad += 1;
            var j = joins[i],
                jurl = j.url,
                jid = j.id,
                jfrom = j.join_field,
                jfield = j.fields,
                jto = j.join_to,
                jcls = _thematicLayers[j.type]["constructor"],
                join = jcls(jurl, {join:true, key:jfrom, fields:jfield, id:jid});

            L.DomEvent.on(join, 'loaded', function(e) {
                stillToLoad -= 1;
            });
            L.DomEvent.on(join, 'loaderror', function(e) {
                stillToLoad -= 1;
                console.error('Smth went horribly wrong during loading ', jurl);
            });
            /* Mis saab siis kui joini laadimisel on viga? */
            options.joins[jto] = join;
        }
    }

    return new Promise(function(resolve, reject) {
        onJoinsReady().then(
            function() {
                resolve(constr(urlTemplate, options));
            }
        );
    });
}

function initThematicLayer(thema, order, z) {
    var type = thema.type,
        layername = thema.layername,
        isVisible = thema.isVisible !== undefined ? thema.isVisible : false,
        minZoom = thema.minZoom !== undefined ? thema.minZoom : map.getMinZoom(),
        maxZoom = thema.maxZoom !== undefined ? thema.maxZoom : map.getMaxZoom(),
        options = Object.assign({}, _thematicLayers[type]["options"]),
        groupname = thema.groupname !== undefined ? thema.groupname : false;
    options.layername = layername;
    options.minZoom = minZoom;
    options.maxZoom = maxZoom;

    var onLayerReady = function(stat, current, l) {
        /* Ootame selle kihi lisamiseks õiget hetke:
        *  eelduseks: järjekorras kõik eelnevad kihid on kaardile lisatud
        *  ning kiht ise on initsialiseeritud.
        */
        return new Promise(function(resolve, reject) {
            var waitForLayers = function() {
                if (stat.numLoaded == current && l !== undefined) {
                    // ok, we're good to go!
                    resolve();
                } else {
                    window.requestAnimationFrame(waitForLayers);
                }
            };
            waitForLayers();
        });
    }

    if (type == "grouplayer.tile") {
        var groupconfig =  thema.layers,
            layers = [],
            grouplayer;
        for (var i=0; i < groupconfig.length; i++) {
            var c = groupconfig[i],
                _type = c.type,
                _options = Object.assign({}, _thematicLayers[_type]["options"]);
            _options = Object.assign(_options, options)

            initLayer(c, _options).then(
                function(layer) {
                    layers.push(layer);
                    if (layers.length == groupconfig.length) {
                        /* Kui kõik grupis olevad kihid on laetud */
                        return L.groupLayer(null, layers);
                    }
                }
            ).then(function(layer) {
                /* ootame signaali, et selle grupikihi järjekord kaardile minna  */
                onLayerReady(order, z, layer).then(function() {
                    addLayer(layer, isVisible, layername, groupname);
                    order.numLoaded += 1;
                });
            });
        }

    } else {
        initLayer(thema, options).then(
            /* ootame signaali, et selle kihi järjekord kaardile minna  */
            function(layer) {
                onLayerReady(order, z, layer).then(function() {
                    addLayer(layer, isVisible, layername, groupname);
                    order.numLoaded += 1;
                });
            }
        );
    }
}

function addLayer(layer, isVisible, layername, groupname) {
    if (isVisible === true) {
        layer.addTo(map);
    }

    if (groupname !== false) {
        var _group = overlays[groupname] === undefined ? {} : overlays[groupname];
        _group[layername] = layer;
        overlays[groupname] = _group;
        layerControl.addOverlay(layer, layername, groupname);
    } else {
        overlays[layername] = layer;
        layerControl.addOverlay(layer, layername);
    }
}
