

// Store our API endpoint as queryUrl.
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place and time of the earthquake.
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
  }

// Function for Circle Color Base on Criteria. The Color Scale is base of the 7 colors of a Rainboy ROY G BIV
function QuakeColor(Qcolor) {
  switch(true) {
      case (Qcolor < 1):
        return "#B7DF5F";
      case (Qcolor < 2):
          return "#DCED11";
      case (Qcolor < 3):
        return "#EDD911";
      case (Qcolor < 4):
          return "#EDB411";
      case (Qcolor < 5):
          return "#ED721";
      default:
        return "#ED4311";
  }
}
//   Create a circle function
function CircleMaker(features, latlng){
  var CircleOptions = {
      radius: features.properties.mag * 5,
      fillColor: QuakeColor(features.properties.mag),
      color: QuakeColor(features.properties.mag),
      weight: 1.0,
      opacity: 1.0,
      fillOpacity: .5

  }
  return L.circleMarker(latlng, CircleOptions)
}

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: CircleMaker
  });

  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);
}
  // Create Legend
  var legend = L.control({
    position: "bottomright"
  });

  // Legend Details
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");

    var grades = [0, 1, 2, 3, 4, 5];
    var colors = [
      "#98ee00",
      "#98ee00",
      "#98ee00",
      "#98ee00",
      "#98ee00",
      "#98ee00"
    ];

    // Loop through
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
      "<i style='background: " + colors[i] + "'></i> " + grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }
    return div;
  };

  legend.addTo(myMap);

function createMap(earthquakes) {

  // Create the base layers.
  var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object.
  var baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [street, earthquakes]
  });

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

}
