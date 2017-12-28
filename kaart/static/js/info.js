L.Control.Graph = L.Control.extend({
    axisMargin : 30,
    margin : 30,
    valueMargin : 4,
    width : 350,
    height : 400,
    barHeight : 10,
    barPadding : 5,
    labelWidth : 0,

    initialize: function(parent, options) {
        L.Control.prototype.initialize.call(this, options);
        this.parent = parent;
        this.options = options;
        var container = this.container = L.DomUtil.create('div', 'graph', this.parent);
        this.data = this.parseDataFromProperties();
        this.drawGraph()
    },
    drawGraph: function() {
        var axisMargin = this.axisMargin,
            margin = this.margin,
            valueMargin = this.valueMargin,
            width = this.width,
            height = this.height,
            barHeight = this.barHeight,
            barPadding = this.barPadding,
            labelWidth = this.labelWidth
            data = this.data;

        svg = d3.select('.graph')
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        max = d3.max(this.data, function(d) { return d.value; });
        max *= 1.1;
        bar = svg.selectAll("g")
            .data(data)
            .enter()
            .append("g");

        bar.attr("class", "bar")
            .attr("cx",0)
            .attr("transform", function(d, i) {
                return "translate(" + margin + "," + (i * (barHeight + barPadding) + barPadding) + ")";
            });

        bar.append("text")
            .attr("class", "label")
            .attr("y", barHeight / 2)
            .attr("dy", ".35em") // vertical align middle
            .attr("dx", "-.35em") // padding on the right of label
            .text(function(d){
                return d.label;
            })
            .each(function() {
                labelWidth = Math.ceil(Math.max(labelWidth, 22));
            });

        scale = d3.scale.linear()
            .domain([0, max])
            .range([0, width - margin - 2 * labelWidth]);

        xAxis = d3.svg.axis()
            .scale(scale)
            .tickSize(-this.height)
            .orient("bottom");

        bar.append("rect")
            .attr("transform", "translate("+labelWidth+", 0)")
            .attr("height", barHeight)
            .attr("width", function(d){
                return scale(d.value);
            });

        axis = svg.insert("g",":first-child")
            .attr("class", "axisHorizontal")
            .attr("transform", "translate(" + (margin + labelWidth + 20) + ","+ ((barHeight + barPadding) * data.length + barPadding)+")")
            .call(xAxis)
            .selectAll('text')
            .attr("y", 0)
            .attr("x", -2)
            .attr("dy", "0.35em")
            .attr("transform", "rotate(-35)")
            .style("text-anchor", "end");

        svg.attr("height", ((barHeight + barPadding) * data.length + barPadding) + 30 );
        this.addAxisTitles(svg);
    },
    parseDataFromProperties: function() {
        var labelKey = this.options.setup.y,
            valueKey = this.options.setup.x,
            properties = this.options.properties,
            keys = properties[labelKey].split(','),
            vals = properties[valueKey].split(','),
            data = []
        for (var i in keys) {
            var label = keys[i],
                val = +vals[i];
            data.push({"label":label, "value":val})
        }
        return data;
    },
    addAxisTitles: function(svg) {
        var w = svg.attr("width"),
            h = svg.attr("height"),
            m = this.margin,
            xLabel = this.options.setup.xLabel,
            yLabel = this.options.setup.yLabel;

        if (xLabel !== undefined) {
            svg.append("text")
                .attr("text-anchor", "middle")
                .attr("transform", "translate("+ (w/2) +","+ (h) +")")
                .text(xLabel);
        }

        if (yLabel !== undefined) {
            svg.append("text")
                .attr("text-anchor", "left")
                .attr("transform", "translate("+ (m/2) + ","+ h/2 +")rotate(-90)")
                .text(yLabel);
        }
    }

});

L.control.graph = function(parent, options){
    return new L.Control.Graph(parent, options);
}

L.Control.Info = L.Control.extend({
    options: {
        position: 'bottomright',
        template: ''
    },
    initialize: function(options) {
        for (var opt in options) {
            this.options[opt] = options[opt];
        }
        L.Control.prototype.initialize.call(this, options);
    },
    onAdd: function(map) {
        this._map = map;
        var container = this._container = L.DomUtil.create('div', 'info');
        map.on('mousemove', function(e) {
            var currentPos = this.getPosition(),
                width = map.getSize().x,
                x = e.containerPoint.x,
                hand = width / 2 > x ? 'right' : 'left',
                topbot = this.getPosition().startsWith('top') ? 'top' : 'bottom',
                position = topbot + hand;
            if (position != currentPos) {
                this.setPosition(position);
            }
        }, this);
        L.DomUtil.addClass(this._container, 'info-hidden');
        return this._container;
    },
    update: function(properties, layername) {
        var opts = this.options,
            template = opts.template,
            gfx = opts.graph;

        if (template === undefined || properties === undefined) {
            this._container.innerHTML = '';
            if (!L.DomUtil.hasClass(this._container, 'info-hidden')) {
                L.DomUtil.addClass(this._container, 'info-hidden');
            }
            return;
        }
        if (L.DomUtil.hasClass(this._container, 'info-hidden')) {
            L.DomUtil.removeClass(this._container, 'info-hidden');
        }
        var title = layername || '',
            heading = L.Util.template(
                '<h3>{title}</h3>', {"title":title}),
            body = marked(L.Util.template(
                template, properties).replace(/(\\r\\n|\\n|\\r)/gm, '<br>')),
            infotempl = '{heading}{body}</br>';
        this._container.innerHTML = L.Util.template(
            infotempl,
            {heading:heading, body:body}
        );

        if (Object.keys(gfx).length > 0) {
            L.control.graph(
                this._container, {"properties":properties, "setup":gfx}
            );
        }

    }
});

L.control.info = function(options){
    return new L.Control.Info(options);
}

L.Control.About = L.Control.extend({
    options: {
        position: 'topleft',
        collapsed: true,
        aboutText: '',
        title: 'Selle kaardi kohta'
    },
    onAdd: function(map) {
        this._map = map;
        var className = 'leaflet-control-about',
            container = this._container = L.DomUtil.create('div', className);
        container.setAttribute('aria-haspopup', true);
        L.DomUtil.addClass(container, 'leaflet-bar');

        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);

        if (this.options.collapsed) {
            L.DomEvent.on(container, 'mouseenter', this.expand, this);
            L.DomEvent.on(container, 'mouseleave', this.collapse, this);
            this._map.on('click', this.collapse, this);
        }

        var link = this._aboutLink = L.DomUtil.create('a', className + '-toggle', container);
        link.href = '#';
        link.title = this.options.title;
        link.innerHTML = 'i';

        if (L.Browser.touch) {
            L.DomEvent.on(link, 'click', L.DomEvent.stop);
            L.DomEvent.on(link, 'click', this.expand, this);
        } else {
        	L.DomEvent.on(link, 'focus', this.expand, this);
        }

        var form = this._form = L.DomUtil.create('form', className + '-list'),
            title = this._title = L.DomUtil.create('h1', className + '-title', form),
            about = this._about = L.DomUtil.create('div', className + '-textarea', form);
        title.innerHTML = '';
        about.innerHTML = this.options.aboutText;
        container.appendChild(form);
        if (!this.options.collapsed) {
            this.expand();
        }
        return container;
    },
    expand: function() {
        var container = this._container,
            expandedClass = 'leaflet-control-about-expanded';
        this._form.style.height = null;
        if (!L.DomUtil.hasClass(container, expandedClass)) {
            L.DomUtil.removeClass(container, 'leaflet-bar');
            L.DomUtil.addClass(container, expandedClass);
        }
        var acceptableHeight = this._map.getSize().y - container.offsetTop - 30;
        if (acceptableHeight < this._form.clientHeight) {
            L.DomUtil.addClass(this._form, 'leaflet-control-about-scrollbar');
            this._form.style.height = acceptableHeight + 'px';
        } else {
            L.DomUtil.removeClass(this._form, 'leaflet-control-about-scrollbar');
        }
        return this;
    },
    collapse: function() {
        var container = this._container,
            expandedClass = 'leaflet-control-about-expanded';
        if (L.DomUtil.hasClass(container, expandedClass)) {
            L.DomUtil.addClass(container, 'leaflet-bar');
            L.DomUtil.removeClass(container, expandedClass);
        }
        return this;
    },
    update: function(title, aboutText) {
        if (title) {
            this._title.innerHTML = title;
        }
        if (aboutText) {
            this._about.innerHTML = aboutText;
        } else {
            this._about.innerHTML = this.options.aboutText;
        }
    }
});

L.control.about = function(options) {
    return new L.Control.About(options);
}
