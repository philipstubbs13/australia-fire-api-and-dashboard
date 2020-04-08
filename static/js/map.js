var satData = "modis.csv";

//////////// IMPORT THE DATA //////////////////
function getData(data) {
  d3.csv(data).then(data => {

    // load territory data

      // load hectare burned data and perform calculations on estimated animal deaths

      makeFeatures(data);
  }).catch(e => {
    console.log(e);
  });
}

getData(satData);

//////////// MAKE THE FEATURES //////////////////
function makeFeatures(data) {

  // make heatmap
  var heatArray = [];

  for (var i = 0; i < data.length; i++) {
    var datapoint = data[i];

    if (datapoint) {
      heatArray.push([datapoint.latitude, datapoint.longitude, datapoint.brightness]);
    }
  }

  var heat = L.heatLayer(heatArray, {
    radius: 20,
    blur: 35
  });



  // call makemap function to create the basemap and apply the features
  makeMap(heat);
  
}

//////////// CREATE THE MAP //////////////////
function makeMap(heat) {
  // Define map style option layers

  var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });

  // Define a baseMaps object for maps layers
  var baseMaps = {
    "Satellite": satellite,
    "Outdoors": outdoors
  };

  // Define overlayMaps for marker layers
  var overlayMaps = {
    // "Fault Lines": faultlines,
    // "Earthquakes": earthquakes
    "Fire intensity": heat
  };

  // // Create a legend
  // var legend = L.control({ position: "bottomright" });

  // legend.onAdd = function() {
  //   var div = L.DomUtil.create("div", "info legend");
  //   var limits = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"];
  //   var labels = [];      

  //   div.innerHTML = "<div class=\"labels\"></div>";

  //   limits.forEach(function(limit, index) {

  //     var colors = ["#c4f069", "#e5f16a", "#efdb67", "#eabb61", "#e5a975", "#e0736f"]
  //     labels.push(`<li style=\"background-color: ${colors[index]};\"><span class=\"legendText\">${limits[index]}</span></li>`);
  //   }); // TODO: Get numbers to appear alongside color boxes

  //   div.innerHTML += "<ul>" + labels.join("") + "</ul>";
  //   return div;
  // };

  // Create a layer control
  var layerControl = L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  });

  // Create our map object
  var myMap = L.map("map", {
    center: [
      -25.799055, 134.538941
    ],
    zoom: 5, 
    layers: [outdoors, heat] // TODO Add in features here
  });

  // Add legend to the map
  // legend.addTo(myMap);
  // Add layer control to the map
  layerControl.addTo(myMap);

}

// makeMap(satData);

