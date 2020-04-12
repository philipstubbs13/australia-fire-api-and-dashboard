// const modisURL = "modis.csv";
const modisURL = "https://australia-fire-api-dashboard.herokuapp.com/api/v1.0/fires_modis";
const viirsURL = "https://australia-fire-api-dashboard.herokuapp.com/api/v1.0/fires_viirs";
const states = "https://raw.githubusercontent.com/rowanhogan/australian-states/master/states.geojson";
const areaURL = "http://australia-fire-api-dashboard.herokuapp.com/api/v1.0/bushfire_season_2019";

// TODO load in second dataset, create function that allows them to choose which dataset to use

//////////// IMPORT THE DATA //////////////////
function getData(modisURL, viirsURL) {
  d3.json(modisURL).then(modisData => {

    d3.json(viirsURL).then(viirsData => {

      d3.json(areaURL).then(areaData => {

        d3.json(states).then(stateData => {

          let borderData = stateData.features;
          
          makeFeatures(modisData, viirsData, borderData, areaData);
    
        }).catch(e => {
          console.log(e);
        });

      });      
      

    }).catch(e => {
      console.log(e);

    });
      
  }).catch(e => {
    console.log(e);
  });
}

getData(modisURL, viirsURL);

//////////// CALCULATE ANIMAL DEATHS PER STATE //////////////////
// Uses general formula described in https://www.bbc.com/news/50986293

// variable to hold calculations, to make later popover
const deathsByState = [];

function animalDeaths(hectareData, stateName) {

  // reformat numbers for millions of deaths - https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  let fireData = Object.entries(hectareData);

  // aggregate "acres burned" by state
  let burnedInStateSum = 0;

  for (var i = 0; i < fireData[0][1].length; i++) {
    let datapoint = fireData[0][1][i];

    if (datapoint.state == stateName) {
      burnedInStateSum += datapoint.area_burned_ha;
    }
  }

  // calculate animal death rate by state
  let hectaresTotal = burnedInStateSum;

  // Estimated number of animals killed per acre
  const mammals = 17.5;
  const birds = 20.7;
  const reptiles = 129.5;

  // multiplied by amount of land hit by fires in each state (hectacreData)
  let mammalDeaths = Math.round(mammals * hectaresTotal);
  let birdDeaths = Math.round(birds * hectaresTotal);
  let reptileDeaths = Math.round(reptiles * hectaresTotal);

  let stateDeaths = {
    "state": stateName,
    "mammals": numberWithCommas(mammalDeaths),
    "birds": numberWithCommas(birdDeaths),
    "reptiles": numberWithCommas(reptileDeaths)
  }

  deathsByState.push(stateDeaths);

}

//////////// MAKE THE FEATURES //////////////////
function makeFeatures(modisData, viirsData, stateData, areaData) {

  const modisDataArr = Object.entries(modisData);
  const viirsDataArr = Object.entries(viirsData);

  // make heatmaps
  let modisHeatArray = [];
  let viirsHeatArray = [];

  for (var i = 0; i < modisDataArr[0][1].length; i++) {
    let datapoint = modisDataArr[0][1][i];

    if (datapoint) {
      modisHeatArray.push([datapoint.latitude, datapoint.longitude, datapoint.brightness]);
    }
  }

  let modisHeat = L.heatLayer(modisHeatArray, {
    radius: 20,
    blur: 35
  });

  for (var i = 0; i < viirsDataArr[0][1].length; i++) {
    let datapoint = viirsDataArr[0][1][i];

    if (datapoint) {
      viirsHeatArray.push([datapoint.latitude, datapoint.longitude, datapoint.bright_ti4]);
    }
  }

  let viirsHeat = L.heatLayer(viirsHeatArray, {
    radius: 20,
    blur: 35
  });

  // make state boundaries

  // feature creation function & get state names
  let stateNames = [];

  function onEachFeature(feature, layer) {
    L.polyline(feature.geometry.coordinates);
    animalDeaths(areaData, feature.properties.STATE_NAME);
    deathsByState.forEach(state => {
      if (state.state = feature.properties.STATE_NAME) {
        layer.bindPopup("<h3>" + state.state + "</h3>Mammal deaths: " +
        state.mammals + "<br>Bird deaths: " + state.birds
        + "<br>Reptile deaths: " + state.reptiles);
      }
    })
  }

  // call feature function "onEachFeature" to make state boundaries
  let borders = L.geoJSON(stateData, {
    onEachFeature: onEachFeature
  });

  // create timeline layer feature
  // let timelineLayer = L.timeline(modisDataArr[0][1], {
  //   getInterval: function(datapoint) {
  //     return {
  //       start: datapoint.acq_time,
  //       end: datapoint.acq_time
  //     };
  //   },
  //   pointToLayer: modisHeat
  // });

  // call makemap function to create the basemap and apply the features
  makeMap(modisHeat, viirsHeat, borders);
  
}

//////////// CREATE THE MAP //////////////////
function makeMap(modisHeat, viirsHeat, borders) {
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
    "Fire intensity (MODIS)": modisHeat,
    "Fire intensity (VIIRS)": viirsHeat
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
    layers: [outdoors, modisHeat] // TODO Add in features here
  });

  // Add legend to the map
  // legend.addTo(myMap);
  // Add layer control to the map
  layerControl.addTo(myMap);

}

// FOR TIMELINE
// create endpoint that would grab data from MongoDB, create JSON -> GeoJSON and then serve it

// https://stackoverflow.com/questions/55887875/how-to-convert-json-to-geojson