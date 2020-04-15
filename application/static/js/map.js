const params = "?start_date=2019-12-21&end_date=2019-12-31"

const modisURL = `${api_base_url}/fires_modis_geojson` + params;
const viirsURL = `${api_base_url}/fires_viirs_geojson` + params;
const states = "https://raw.githubusercontent.com/rowanhogan/australian-states/master/states.geojson";
const areaURL = `${api_base_url}/fires_bystate`;


//////////// IMPORT THE DATA //////////////////

function getData(modisURL, viirsURL) {
  d3.json(modisURL).then(modisData => {

    d3.json(viirsURL).then(vData => {

      let viirsData = vData.features;

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
  let homesLost = 0;
  let fatalities = 0;

  for (var i = 0; i < fireData[0][1].length; i++) {
    let datapoint = fireData[0][1][i];

    if (datapoint.state == stateName) {
      burnedInStateSum += datapoint.area_burned_ha;
      fatalities += datapoint.fatalities;
      homesLost += datapoint.homeslost;
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
    "fatalities": numberWithCommas(fatalities),
    "mammals": numberWithCommas(mammalDeaths),
    "birds": numberWithCommas(birdDeaths),
    "reptiles": numberWithCommas(reptileDeaths),
    "homes_lost": numberWithCommas(homesLost)
  }

  deathsByState.push(stateDeaths);

}

//////////// MAKE THE FEATURES //////////////////
function makeFeatures(modisData, viirsData, stateData, areaData) {

  let modisFeatures = modisData.features;

  // parse data for heatmap
  const modisDataArr = Object.entries(modisFeatures);
  const viirsDataArr = Object.entries(viirsData);

  // make heatmaps
  let modisHeatArray = [];
  let viirsHeatArray = [];

  for (var i = 0; i < modisDataArr.length; i++) {
    let datapoint = modisDataArr[i][1];

    if (datapoint) {
      modisHeatArray.push([datapoint.geometry.coordinates[1], datapoint.geometry.coordinates[0], datapoint.properties.brightness]);
    }
  }

  let modisHeat = L.heatLayer(modisHeatArray, {
    radius: 20,
    blur: 35
  });

  for (var i = 0; i < viirsDataArr.length; i++) {
    let datapoint = viirsDataArr[i][1];

    if (datapoint) {
      viirsHeatArray.push([datapoint.geometry.coordinates[1], datapoint.geometry.coordinates[0], datapoint.properties.bright_ti4]);
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
        layer.bindPopup("<h3>" + state.state + "</h3>Fatalities: " +
        state.fatalities + "<br>Mammal deaths: " +
        state.mammals + "<br>Bird deaths: " + state.birds
        + "<br>Reptile deaths: " + state.reptiles +
        "<br>Homes lost: " + state.homes_lost);
      }
    })
  }

  // call feature function "onEachFeature" to make state boundaries
  let borders = L.geoJSON(stateData, {
    onEachFeature: onEachFeature
  });

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
    "State losses (total)": borders,
    "Fire intensity (MODIS)": modisHeat,
    "Fire intensity (VIIRS)": viirsHeat
  };

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
    layers: [outdoors, modisHeat]
  });

  // Add legend to the map that describes how to interact and what data is in the different layers

  // Create a legend
  var legend = L.control({ position: "bottomright" });

  legend.onAdd = function() {
    let div = L.DomUtil.create("div", "info legend");      

    div.innerHTML = `<div class=\"labels\">
                      <h3>Australian Bushfires, December 21-31, 2019</h3> 
                      <p>This map contains satellite data readings 
                      from ten days in December 2019, the worst of the recent 
                      bushfire season.</p>
                      <p>Toggle between VIIRS and MODIS satellite 
                      readings using the controls above.</p>
                      <p>Learn more about losses during the entire 
                      2019-2020 bushfire season by activating the 
                      State Losses layer and clicking on each state.</p>
                    </div>`;
    return div;
  };

  legend.addTo(myMap);
  layerControl.addTo(myMap);
}