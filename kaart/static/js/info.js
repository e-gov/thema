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
        return this._container;
    },
    update: function(properties, layername) {
        var template = this.options.template;

        if (template === undefined || properties === undefined) {
            this._container.innerHTML = '';
            return;
        }
        var title = layername || '',
            heading = L.Util.template(
                '<h4>{title}</h4>', {"title":title}),
            body = L.Util.template(
                template, properties),
            infotempl = '{heading}</br>{body}';
        this._container.innerHTML = L.Util.template(
            infotempl,
            {heading:heading, body:body}
        );
    }
});

L.control.info = function(options){
    return new L.Control.Info(options);
}

function initInfo(options) {
    var info = L.control.info({position:'bottomright'});
    info.addTo(map);
}
