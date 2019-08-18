var test = require('tape');
var destination = require('../');
var turf = require('@turf/turf');

test('destination', function(t){
  var pt1 = {
    "type": "Feature",
    "geometry": {"type": "Point", "coordinates": [-80.191788, 25.761681]}
  };
  var units = 'kilometers';
  var dist = 50; // this seems to be meters.... units not working?
  var bear = 145;
  var pt2 = destination(pt1, dist, bear, units);
  console.log('');
  console.log('Point 1 coordinates: ',);
  console.log(pt1.geometry.coordinates);
  console.log('');
  console.log('Parameters for new point: ');
  console.log(dist+' '+units+', bearing '+145+' degrees.');
  console.log('');
  console.log('Point 2 coordinates: ');
  console.log(pt2.geometry.coordinates);
  console.log('');
  var distance = turf.distance(pt1, pt2, { units });
  console.log('Point 1 <-> Point 2 calculated distance w/Turf: ');
  console.log(distance+' '+units);
  console.log('');
  t.ok(pt2, 'should return a point');
  t.end();
});
