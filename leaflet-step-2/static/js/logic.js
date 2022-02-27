// Create a variable for the query url
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";
var platesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Connect to the query url using D3 & create the data features
d3.json(queryUrl).then(function (data) {
  d3.json(platesUrl).then(function(plates){ 
    createFeatures(data.features, plates.features);
  });
});

function createFeatures(earthquakeData, platesData) {

  // Create a function to determine the size & colour of each marker on the map, depending on the magnitude & depth of the earthquake
  function getRadius(mag) {
    return mag * 2.5
  }
  function getColor(feature){
    let depth = feature.geometry.coordinates[2];
    let colour = "#B7DF5F";
    if      ( depth > 90) { colour = "#ED4311" }
    else if ( depth > 70) { colour = "#ED7211" }
    else if ( depth > 50) { colour = "#EDB411" }
    else if ( depth > 30) { colour = "#EDD911" }
    else if ( depth > 10) { colour = "#DCED11" }
    return(colour)
  }

  // Create a function to plot a circle for each feature in the json
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}<br>Magnitude: ${(feature.properties.mag)}<br>Depth: ${(feature.geometry.coordinates[2])}</p>`);
  }
  function pointToLayer (feature, latlng) {
    return new L.CircleMarker ( latlng, {
      radius: getRadius(feature.properties.mag),
      color: 'grey',
      fillColor: getColor(feature),
      fillOpacity: 0.5,
      weight: 1
    });
  }

  // Create a variable for tectonic plate boundaries on the map
  function boundaries(platesData) {
    allPlates = []
    for (var i = 0; i < platesData.length; i++) {
      var plate = platesData[i];
      var plateCoords = [];
      coordinates = plate.geometry.coordinates;
      for (j = 0; j < coordinates.length; j++) {
        plateCoords.push([coordinates[j][1], coordinates[j][0]]);
      }
      allPlates.push(
        L.polyline(plateCoords)
      )
    }
    return L.layerGroup(allPlates);
  };

  // Create the overlay for the newly created earthquake data plots & send to the map
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer : pointToLayer,
    onEachFeature: onEachFeature
  });

  var plate = boundaries(platesData);

  createMap(earthquakes, plate);
}

function createMap(earthquakes, plate) {
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
    Earthquakes: earthquakes,
    "Plates": plate
  };

  // Create our map, giving it the streetmap & earthquakes layers to display on load.
  var myMap = L.map("map", {
    center: [ 37.09, -95.71 ],
    zoom: 4,
    layers: [street, earthquakes, plate]
  });

  // Create a layer control.
  // Pass it our baseMaps & overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
  
  // Legend for the map
  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function (map) {
    var div = L.DomUtil.create("div", "legend");
    div.innerHTML += "<b>Depth</b><br>";
    div.innerHTML += '<i style="background: #B7DF5F"></i><span>&lt;10</span><br>';
    div.innerHTML += '<i style="background: #DCED11"></i><span>10-30</span><br>';
    div.innerHTML += '<i style="background: #EDD911"></i><span>30-50</span><br>';
    div.innerHTML += '<i style="background: #EDB411"></i><span>50-70</span><br>';
    div.innerHTML += '<i style="background: #ED7211"></i><span>70-90</span><br>';
    div.innerHTML += '<i style="background: #ED4311"></i><span>&gt;90</span><br>';
    return div;
  };
  legend.addTo(myMap);
}