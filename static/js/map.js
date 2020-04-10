const satData = "modis.csv";
const states = "https://raw.githubusercontent.com/rowanhogan/australian-states/master/states.geojson"
// TODO load in second dataset, create function that allows them to choose which dataset to use

//////////// CALCULATE ANIMAL DEATHS PER STATE //////////////////
// Uses general formula described in https://www.bbc.com/news/50986293

// Estimated number of animals killed per acre
const mammals = 7.25;
const birds = 8.38;
const reptiles = 52.41;

// multiplied by amount of land hit by fires



//////////// IMPORT THE DATA //////////////////
function getData(satData) {
  d3.csv(satData).then(satData => {

    // load state data from https://github.com/rowanhogan/australian-states
    d3.json(states).then(stateData => {

      let newData = stateData.features;

      // load hectare burned data and perform calculations on estimated animal deaths

      makeFeatures(satData, newData);

    }).catch(e => {
      console.log(e);
    });
      
  }).catch(e => {
    console.log(e);
  });
}

getData(satData);

//////////// MAKE THE FEATURES //////////////////
function makeFeatures(data, stateData) {

  // make heatmap
  let heatArray = [];

  for (var i = 0; i < data.length; i++) {
    let datapoint = data[i];

    if (datapoint) {
      heatArray.push([datapoint.latitude, datapoint.longitude, datapoint.brightness]);
    }
  }

  let heat = L.heatLayer(heatArray, {
    radius: 20,
    blur: 35
  });

  // make state boundaries

  // feature creation function
  function onEachFeature(feature, layer) {
    L.polyline(feature.geometry.coordinates)
  }
  
  // call feature function "onEachFeature" to make state boundaries
  let borders = L.geoJSON(stateData, {
    onEachFeature: onEachFeature
  });
  console.log(borders);



  // call makemap function to create the basemap and apply the features
  makeMap(heat, borders);
  
}

//////////// CREATE THE MAP //////////////////
function makeMap(heat, borders) {
  // Define map style option layers

  let satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  let outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });

  // Define a baseMaps object for maps layers
  let baseMaps = {
    "Satellite": satellite,
    "Outdoors": outdoors
  };

  // Define overlayMaps for marker layers
  let overlayMaps = {
    "States": borders,
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

  // create a slider for date data (to see changes by day) https://digital-geography.com/filter-leaflet-maps-slider/

  // Create a layer control
  let layerControl = L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  });

  // Create our map object
  let myMap = L.map("map", {
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

