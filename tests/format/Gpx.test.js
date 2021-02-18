BR = {};
turf = require('@turf/turf');
togpx = require('togpx');
require('leaflet');
require('../../js/format/VoiceHints.js');
require('../../js/format/Gpx.js');

const fs = require('fs');

const geoJson = require('./data/track.json');
const path = 'tests/format/data/';

// resolve intended/accepted differences before comparing
function adoptGpx(gpx) {
    const creator = 'togpx';
    const name = 'Track';
    const newline = '\n';

    gpx = gpx.replace('=.0', '=0.0');
    gpx = gpx.replace(/creator="[^"]*"/, `creator="${creator}"`);
    gpx = gpx.replace(`creator="${creator}" version="1.1"`, `version="1.1" \n creator="${creator}"`);
    gpx = gpx.replace(/<trk>\n  <name>[^<]*<\/name>/, `<trk>\n  <name>${name}</name>`);
    gpx = gpx
        .split(newline)
        .map((line) => line.replace(/lon="([^"]*)" lat="([^"]*)"/, 'lat="$2" lon="$1"'))
        .join(newline);
    gpx = gpx.replace(/(lon|lat)="([-0-9]+.[0-9]+?)0+"/g, '$1="$2"'); // remove trailing zeros
    gpx = gpx.replace('</gpx>\n', '</gpx>');

    return gpx;
}

function read(fileName) {
    return adoptGpx(fs.readFileSync(path + fileName, 'utf8'));
}

test('simple track', () => {
    const brouterGpx = read('track.gpx');
    const gpx = BR.Gpx.format(geoJson);
    expect(gpx).toEqual(brouterGpx);
});

describe('voice hints', () => {
    test('5-gpsies', () => {
        const brouterGpx = BR.Gpx.pretty(read('5-gpsies.gpx'));
        const gpx = BR.Gpx.format(geoJson, 5);
        expect(gpx).toEqual(brouterGpx);
    });
});
