const modisURL = "modis.csv";
const states = "https://raw.githubusercontent.com/rowanhogan/australian-states/master/states.geojson"
// https://australia-fire-api-dashboard.herokuapp.com/api/v1.0/fires_modis
// https://australia-fire-api-dashboard.herokuapp.com/api/v1.0/fires_viirs

// TODO load in second dataset, create function that allows them to choose which dataset to use

//////////// CALCULATE ANIMAL DEATHS PER STATE //////////////////
// Uses general formula described in https://www.bbc.com/news/50986293

// variable to hold calculations, to make later popover
const deathsByState = [];

function animalDeaths(acreData, stateName) {
  // Estimated number of animals killed per acre
  const mammals = 7.25;
  const birds = 8.38;
  const reptiles = 52.41;

  // multiplied by amount of land hit by fires in each state (acreData)
  let mammalDeaths = Math.round(mammals * acreData);
  let birdDeaths = Math.round(birds * acreData);
  let reptileDeaths = Math.round(reptiles * acreData);

  let stateDeaths = {
    "state": stateName,
    "mammals": mammalDeaths,
    "birds": birdDeaths,
    "reptiles": reptileDeaths
  }

  deathsByState.push(stateDeaths);

  // create popover for feature to display name, animal death rate

}

function makePopups(feature, layer) {
  stateDeaths.forEach(state => {
    if (state = feature.properties.STATE_NAME) {
      layer.bindPopup("<h3>" + feature.properties.STATE_NAME + "</h3>");
    }
  })
}

function acresBurned(stateName) {
  // retrieve scraped wikipedia data from API  
  // aggregate "acres burned" by state
  // calculate animal death rate by state
    // using 1200 as a stand in for total acres burned
  let acresTotal = 1200;
  // pass this data to another function that creates popovers for states on map layer
  animalDeaths(acresTotal, stateName);
}

//////////// IMPORT THE DATA //////////////////
function getData(modisURL) {
  d3.csv(modisURL).then(modisData => {

    // load state data from https://github.com/rowanhogan/australian-states
    d3.json(states).then(stateData => {

      let borderData = stateData.features;

      // load hectare burned data and perform calculations on estimated animal deaths
      
      makeFeatures(modisData, borderData);

    }).catch(e => {
      console.log(e);
    });
      
  }).catch(e => {
    console.log(e);
  });
}

getData(modisURL);

//////////// MAKE THE FEATURES //////////////////
function makeFeatures(satData, stateData) {

  // make heatmap
  let heatArray = [];

  for (var i = 0; i < satData.length; i++) {
    let datapoint = satData[i];

    if (datapoint) {
      heatArray.push([datapoint.latitude, datapoint.longitude, datapoint.brightness]);
    }
  }

  let heat = L.heatLayer(heatArray, {
    radius: 20,
    blur: 35
  });

  // make state boundaries

  // feature creation function & get state names
  let stateNames = [];

  function onEachFeature(feature, layer) {
    L.polyline(feature.geometry.coordinates);
    acresBurned(feature.properties.STATE_NAME);
  }
  
  // call feature function "onEachFeature" to make state boundaries
  let borders = L.geoJSON(stateData, {
    // onEachFeature: onEachFeature, makePopups
    onEachFeature: onEachFeature
  });

  console.log(deathsByState);

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

