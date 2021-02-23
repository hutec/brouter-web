BR.Overpass = L.Control.extend({
    options: {
        overpassBaseUrl: BR.conf.overpassBaseUrl || 'https://overpass-api.de/api/interpreter?data=',
    },

    initialize: function (options) {
        L.setOptions(this, options);
    },

    onAdd: function (map) {
        var self = this;
        this.map = map;
        this.markersLayer = L.layerGroup([]).addTo(map);

        this.drawButton = L.easyButton({
            states: [
                {
                    stateName: 'activate-overpass',
                    icon: 'fa-snowflake-o active',
                },
                {
                    stateName: 'deactivate-overpass',
                    icon: 'fa-snowflake-o',
                },
            ],
        }).addTo(map);

        const bounds = map.getBounds();
        const boundsString = `(${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()})`;
        const part = '"amenity"="drinking_water"';
        const query = `[out:json][timeout:25];(node[${part}]${boundsString};way[${part}]${boundsString};relation[${part}]${boundsString};);out;>;out skel qt;`;

        var url = this.options.overpassBaseUrl + query;

        BR.Util.getJson(
            url,
            'overcast call',
            L.bind(function (err, osmJson) {
                if (!err) {
                    //console.log(osmJson);
                    var geoJson = osmtogeojson(osmJson);
                    console.log(geoJson);
                    this._setBoundary(geoJson);
                }
            }, this)
        );

        var url = this.options.overpassBaseUrl + query;

        var container = new L.DomUtil.create('div');
        return container;
    },

    _setBoundary: function (geoJson) {
        // var boundaryLine = turf.polygonToLine(geoJson.features[0]);
        function onEachFeature(feature, layer) {
            // does this feature have a property named popupContent?
            if (feature.properties) {
                layer.bindPopup(feature.properties.name);
            }
        }

        this.overpassLayer = L.geoJson(geoJson.features, {
            onEachFeature: onEachFeature,
        }).addTo(this.map);
    },
});

BR.Overpass.include(L.Evented.prototype);
