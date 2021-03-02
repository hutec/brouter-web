BR.OverpassTab = L.Class.extend({
    options: {
        overpassBaseUrl: BR.conf.overpassBaseUrl || 'https://overpass-api.de/api/interpreter?data=',
    },

    initialize: function (map, options) {
        L.setOptions(this, options);
        this.map = map;
        console.log(this.map.getBounds());
        this.textArea = L.DomUtil.get('overpass-query');
        this.colorPicker = L.DomUtil.get('overpass-color');
        this.textArea.value = '"amenity"="drinking_water"';

        L.DomUtil.get('submit-overpass').onclick = L.bind(this.execute, this);
        L.DomUtil.get('clear-overpass').onclick = L.bind(this.clear, this);
    },

    execute: function (evt) {
        const bounds = this.map.getBounds();
        const boundsString = `(${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()})`;
        const part = this.textArea.value; // '"amenity"="drinking_water"';
        const query = `[out:json][timeout:5];(node[${part}]${boundsString};way[${part}]${boundsString};relation[${part}]${boundsString};);out;>;out skel qt;`;

        var url = this.options.overpassBaseUrl + query;

        BR.Util.getJson(
            url,
            'overcast call',
            L.bind(function (err, osmJson) {
                if (!err) {
                    //console.log(osmJson);
                    var geoJson = osmtogeojson(osmJson);
                    console.log(geoJson);
                    this.displayResults(geoJson);
                }
            }, this)
        );
    },

    displayResults: function (geoJson) {
        function onEachFeature(feature, layer) {
            if (feature.properties) {
                const content = popupContent(feature.properties);
                layer.bindPopup(content);
            }
        }

        var myStyle = {
            color: this.colorPicker.value,
            weight: 5,
            opacity: 1,
        };

        this.overpassLayer = L.geoJson(geoJson.features, {
            onEachFeature: onEachFeature,
            style: myStyle,
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, myStyle);
            },
        }).addTo(this.map);
    },

    clear: function (evt) {
        this.map.removeLayer(this.overpassLayer);
    },
});

const popupContent = (properties) => {
    var ret = '';
    for (const [key, value] of Object.entries(properties)) {
        if (key === 'id') {
            const osmURL = 'https://www.openstreetmap.org/' + value;
            ret += `<a href="${osmURL}">${value}</a>`;
        } else if (key === 'website') {
            ret += `<span><b>${key}</b>: <a href="${value}">${value}</a></span>`;
        } else {
            ret += `<p><b>${key}</b>: ${value}</p>`;
        }
    }
    return ret;
};
