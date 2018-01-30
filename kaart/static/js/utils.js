/** polyfill Object.assign toele IEs.
*   ---------------------------------
*   Allikas: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
*/

if (typeof Object.assign != 'function') {
    // Must be writable: true, enumerable: false, configurable: true
    Object.defineProperty(Object, "assign", {
        value: function assign(target, varArgs) { // .length of function is 2
            'use strict';
            if (target == null) { // TypeError if undefined or null
                throw new TypeError('Cannot convert undefined or null to object');
            }

            var to = Object(target);

            for (var index = 1; index < arguments.length; index++) {
                var nextSource = arguments[index];

                if (nextSource != null) { // Skip over if undefined or null
                    for (var nextKey in nextSource) {
                        // Avoid bugs when hasOwnProperty is shadowed
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        },
        writable: true,
        configurable: true
    });
}

/** polyfill String.startsWith toele IEs.
*   -------------------------------------
*   Allikas: https://stackoverflow.com/a/30867255
*/


if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position) {
        position = position || 0;
        return this.indexOf(searchString, position) === position;
    };
}

/*
L.SVG.include({
    _initGradient: function(id, cx, cy, fx, fy, r) {
        var svg = this._container,
            defs = svg.getElementsByTagName('defs');
        if (defs.length == 0) {
            defs = L.SVG.create('defs');
            svg.insertAdjacentElement('afterbegin', defs);
        } else {
            defs = defs[0];
        }
        var gradient = defs.getElementsByTagName('radialGradient');
        if (gradient.length == 0) {
            gradient = L.SVG.create('radialGradient');
            gradient.setAttribute("id", id);
            gradient.setAttribute("cx", cx);
            gradient.setAttribute("cy", cy);
            gradient.setAttribute("fx", fx);
            gradient.setAttribute("fy", fy);
            gradient.setAttribute("r", r);
        } else {
            gradient = gradient[0];
        }
        defs.insertAdjacentElement('afterbegin', gradient);
        return gradient;
    },
    _getGradient: function(id) {
        var svg = this._container;
        // hetkel (tegelt võiks initGradient ka siit käia hoopis):
        return svg.getElementsByTagName('radialGradient')[0];

    },
    _getGradientStop: function(gradientId, offset) {
        var gradients = this._getGradient(gradientId),
            stops = gradients.getElementsByTagName('stop'),
            stop;
        for (var i=0; i<stops.length; i++) {
            var s = stops[i],
                stopOffset = s.getAttribute("offset");
            if (stopOffset == offset) {
                stop = s;
                break;
            }
        }
        return stop;
    },
    _addGradientStop: function(gradientId, offset, stopColor, stopOpacity) {
        var gradient = this._getGradient(gradientId),
            stop = this._getGradientStop(gradientId, offset);

        if (stop) {return;}

        stop = L.SVG.create('stop');
        stop.setAttribute("offset", offset);
        stop.setAttribute("style", "stop-color:"+stopColor+";stop-opacity:"+stopOpacity);
        gradient.appendChild(stop);

    }
})
*/

/** Natuke värvimatemaatikat
*   ------------------------
*   Allikas: https://stackoverflow.com/a/16360660. Natuke modifitseeritud kujul.
*/


String.prototype.toColorHex = function(val) {
    s = val.toString(16);
    return s.length == 1 ? '0' + s : s;
}

String.prototype.colorGradient = function(stop, ratio) {
    var r, g, b,
        start = this.toLowerCase();
    if (this.substring(0,1) != '#') {
        start = this.colorNameToHex();
    }
    if (stop.substring(0,1) != '#') {
        stop = stop.colorNameToHex();
    }
    r = Math.ceil(parseInt(start.substring(1,3), 16) * ratio + parseInt(stop.substring(1,3), 16) * (1-ratio));
    g = Math.ceil(parseInt(start.substring(3,5), 16) * ratio + parseInt(stop.substring(3,5), 16) * (1-ratio));
    b = Math.ceil(parseInt(start.substring(5,7), 16) * ratio + parseInt(stop.substring(5,7), 16) * (1-ratio));
    return '#' + this.toColorHex(r)+ this.toColorHex(g) + this.toColorHex(b);
}


/** Värvi nimi HEXiks.
*   ------------------
*   Allikas: https://gist.github.com/mxfh/4719348#file-colorhelpersforcanvas-js
*/


String.prototype.colorNameToHex = function (returnUnresolved) {
    // color list from http://stackoverflow.com/q/1573053/731179  with added gray/gray
	var hexRGB, definedColorNames = {
        "aliceblue": "#f0f8ff", "antiquewhite": "#faebd7", "aqua": "#00ffff",
        "aquamarine": "#7fffd4", "azure": "#f0ffff", "beige": "#f5f5dc",
        "bisque": "#ffe4c4", "black": "#000000", "blanchedalmond": "#ffebcd",
        "blue": "#0000ff", "blueviolet": "#8a2be2", "brown": "#a52a2a",
        "burlywood": "#deb887", "cadetblue": "#5f9ea0", "chartreuse": "#7fff00",
        "chocolate": "#d2691e", "coral": "#ff7f50", "cornflowerblue": "#6495ed",
        "cornsilk": "#fff8dc", "crimson": "#dc143c", "cyan": "#00ffff",
        "darkblue": "#00008b", "darkcyan": "#008b8b", "darkgoldenrod": "#b8860b",
        "darkgray": "#a9a9a9", "darkgreen": "#006400", "darkkhaki": "#bdb76b",
        "darkmagenta": "#8b008b", "darkolivegreen": "#556b2f", "darkorange": "#ff8c00",
        "darkorchid": "#9932cc", "darkred": "#8b0000", "darksalmon": "#e9967a",
        "darkseagreen": "#8fbc8f", "darkslateblue": "#483d8b",
        "darkslategray": "#2f4f4f", "darkturquoise": "#00ced1", "darkviolet": "#9400d3",
        "deeppink": "#ff1493", "deepskyblue": "#00bfff", "dimgray": "#696969",
        "dodgerblue": "#1e90ff", "firebrick": "#b22222", "floralwhite": "#fffaf0",
        "forestgreen": "#228b22", "fuchsia": "#ff00ff", "gainsboro": "#dcdcdc",
        "ghostwhite": "#f8f8ff", "gold": "#ffd700", "goldenrod": "#daa520",
        "gray": "#808080", "green": "#008000", "greenyellow": "#adff2f",
        "honeydew": "#f0fff0", "hotpink": "#ff69b4", "indianred ": "#cd5c5c",
        "indigo ": "#4b0082", "ivory": "#fffff0", "khaki": "#f0e68c", "lavender": "#e6e6fa",
        "lavenderblush": "#fff0f5", "lawngreen": "#7cfc00", "lemonchiffon": "#fffacd",
        "lightblue": "#add8e6", "lightcoral": "#f08080", "lightcyan": "#e0ffff",
        "lightgoldenrodyellow": "#fafad2", "lightgrey": "#d3d3d3", "lightgreen": "#90ee90",
        "lightpink": "#ffb6c1", "lightsalmon": "#ffa07a", "lightseagreen": "#20b2aa",
        "lightskyblue": "#87cefa", "lightslategray": "#778899", "lightsteelblue": "#b0c4de",
        "lightyellow": "#ffffe0", "lime": "#00ff00", "limegreen": "#32cd32",
        "linen": "#faf0e6", "magenta": "#ff00ff", "maroon": "#800000", "mediumaquamarine": "#66cdaa",
        "mediumblue": "#0000cd", "mediumorchid": "#ba55d3", "mediumpurple": "#9370d8",
        "mediumseagreen": "#3cb371", "mediumslateblue": "#7b68ee", "mediumspringgreen": "#00fa9a",
        "mediumturquoise": "#48d1cc", "mediumvioletred": "#c71585", "midnightblue": "#191970",
        "mintcream": "#f5fffa", "mistyrose": "#ffe4e1", "moccasin": "#ffe4b5",
        "navajowhite": "#ffdead", "navy": "#000080", "oldlace": "#fdf5e6",
        "olive": "#808000", "olivedrab": "#6b8e23", "orange": "#ffa500",
        "orangered": "#ff4500", "orchid": "#da70d6", "palegoldenrod": "#eee8aa",
        "palegreen": "#98fb98", "paleturquoise": "#afeeee", "palevioletred": "#d87093",
        "papayawhip": "#ffefd5", "peachpuff": "#ffdab9", "peru": "#cd853f", "pink": "#ffc0cb",
        "plum": "#dda0dd", "powderblue": "#b0e0e6", "purple": "#800080", "red": "#ff0000",
        "rosybrown": "#bc8f8f", "royalblue": "#4169e1", "saddlebrown": "#8b4513",
        "salmon": "#fa8072", "sandybrown": "#f4a460", "seagreen": "#2e8b57", "seashell": "#fff5ee",
        "sienna": "#a0522d", "silver": "#c0c0c0", "skyblue": "#87ceeb", "slateblue": "#6a5acd",
        "slategray": "#708090", "snow": "#fffafa", "springgreen": "#00ff7f", "steelblue": "#4682b4",
        "tan": "#d2b48c", "teal": "#008080", "thistle": "#d8bfd8", "tomato": "#ff6347",
        "turquoise": "#40e0d0", "violet": "#ee82ee", "wheat": "#f5deb3", "white": "#ffffff",
        "whitesmoke": "#f5f5f5", "yellow": "#ffff00", "yellowgreen": "#9acd32",
        "darkgrey": "#a9a9a9", "darkslategrey": "#2f4f4f", "dimgrey": "#696969",
        "grey": "#808080", "lightgray": "#d3d3d3", "lightslategrey": "#778899",
        "slategrey": "#708090"};
	if (definedColorNames[this.toLowerCase()] !== undefined) {
		hexRGB = definedColorNames[this.toLowerCase()];
		// to keep unresolved strings set flag returnUnresolved to true
	} else {if (returnUnresolved) {hexRGB = this; } else {hexRGB = undefined; } }
	return hexRGB;
};
