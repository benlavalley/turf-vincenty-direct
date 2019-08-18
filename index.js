//http://en.wikipedia.org/wiki/Vincenty%27s_formulae
//https://gist.github.com/mathiasbynens/354587
var turf = require('@turf/turf');

/**
 * Takes a {@link Point} and calculates the location of a destination point given a distance in degrees, radians, miles, or kilometers; and bearing in degrees. This uses the [Vincenty's Formulae](https://en.wikipedia.org/wiki/Vincenty%27s_formulae) to account for global curvature.
 *
 * @module turf/vincenty-direct
 * @category measurement
 * @param {Feature<Point>} start starting point
 * @param {Number} distance distance from the starting point
 * @param {Number} bearing ranging from -180 to 180
 * @param {String} units miles, kilometers, feet, or meters
 * @returns {Feature<Point>} destination point
 * @example
 * var point = {
 *   "type": "Feature",
 *   "properties": {
 *     "marker-color": "#0f0"
 *   },
 *   "geometry": {
 *     "type": "Point",
 *     "coordinates": [-75.343, 39.984]
 *   }
 * };
 * var distance = 50;
 * var bearing = 90;
 * var units = 'miles';
 *
 * var destination = turf.destination(point, distance, bearing, units);
 * destination.properties['marker-color'] = '#f00';
 *
 * var result = {
 *   "type": "FeatureCollection",
 *   "features": [point, destination]
 * };
 *
 * //=result
 */

module.exports = function(point1, distance, bearing, units) {
  var coordinates1 = point1.geometry.coordinates;
  var s;
  switch (units) {
    case 'miles':
      s = distance * 1609.34;
      break;
    case 'kilometers':
      s = distance * 1000;
      break;
    case 'meters':
      s = distance;
      break;
    case 'feet':
      s = distance * 0.3048;
      break;
    case undefined:
      s = distance;
      break;
    default:
      throw new Error('unknown option given to "units"');
  }
  var a = 6378137, // length of semi-major axis of the ellipsoid (radius at equator);  (6378137.0 metres in WGS-84)
    b = 6356752.3142, // length of semi-minor axis of the ellipsoid (radius at the poles); (6356752.314245 meters in WGS-84)
    f = 1 / 298.257223563, // flattening of the ellipsoid; (1/298.257223563 in WGS-84)
    alpha1 = toRad(bearing),
    sinAlpha1 = Math.sin(alpha1),
    cosAlpha1 = Math.cos(alpha1),
    tanU1 = (1 - f) * Math.tan(toRad(coordinates1[1])),
    cosU1 = 1 / Math.sqrt((1 + tanU1 * tanU1)),
    sinU1 = tanU1 * cosU1,
    sigma1 = Math.atan2(tanU1, cosAlpha1),
    sinAlpha = cosU1 * sinAlpha1,
    cosSqAlpha = 1 - sinAlpha * sinAlpha,
    uSq = cosSqAlpha * (a * a - b * b) / (b * b),
    A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq))),
    B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq))),
    sigma = s / (b * A),
    sigmaP = 2 * Math.PI;
  while (Math.abs(sigma - sigmaP) > 1e-12) {
    var cos2SigmaM = Math.cos(2 * sigma1 + sigma),
      sinSigma = Math.sin(sigma),
      cosSigma = Math.cos(sigma),
      deltaSigma = B * sinSigma * (cos2SigmaM + B / 4 * (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) - B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM)));
    sigmaP = sigma;
    sigma = s / (b * A) + deltaSigma;
  };
  var tmp = sinU1 * sinSigma - cosU1 * cosSigma * cosAlpha1,
    y2 = Math.atan2(sinU1 * cosSigma + cosU1 * sinSigma * cosAlpha1, (1 - f) * Math.sqrt(sinAlpha * sinAlpha + tmp * tmp)),
    lambda = Math.atan2(sinSigma * sinAlpha1, cosU1 * cosSigma - sinU1 * sinSigma * cosAlpha1),
    C = f / 16 * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha)),
    L = lambda - (1 - C) * f * sinAlpha * (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM))),
    revAz = Math.atan2(sinAlpha, -tmp); // final bearing
    return new turf.point([coordinates1[0] + toDeg(L), toDeg(y2)]);
};

function toRad(degree) {
  return degree * Math.PI / 180;
};

function toDeg(radian) {
  return radian * 180 / Math.PI;
};
