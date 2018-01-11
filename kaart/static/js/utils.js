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
