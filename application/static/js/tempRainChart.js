// Define SVG area dimensions
var svgWidthTR = 1100;
var svgHeightTR = 550;

// Define the chart's margins as an object
var chartMargin = {
  top: 10,
  right: 40,
  bottom: 110,
  left: 160
};

// Define dimensions of the chart area
var chartWidthTR = svgWidthTR - chartMargin.left - chartMargin.right;
var chartHeightTR = svgHeightTR - chartMargin.top - chartMargin.bottom;

//URL to get data
var tempRain_url = `${api_base_url}/aus_temp_rainfall`;
console.log(tempRain_url);

// Select chart id, append SVG area to it, and set the dimensions
var svgTR = d3.select("#temp-rain-chart")
  .append("svg")
  .attr("height", svgHeightTR)
  .attr("width", svgWidthTR)

// Append a group to the SVG area and shift ('translate') it to the right and down
var chartGroupTR = svgTR.append("g")
  .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

// Initial variables
var chosenYAxisWeather = "avg_annual_temp";
var yLinearScaleTR = yLinearScaleTR;
var formatDecimal = d3.format(".1f");

// scale y to chart width, include if variable for different y axis scaling
function yWeatherScale(weatherData, chosenYAxisWeather) {
  if (chosenYAxisWeather === "avg_annual_temp") {
    yLinearScaleTR = d3.scaleLinear()
      .domain([d3.min(weatherData, d => d[chosenYAxisWeather] * 0.95), d3.max(weatherData, d => d[chosenYAxisWeather]) * 1.05])
      .range([chartHeightTR, 0]);
  }
  else {
      yLinearScaleTR = d3.scaleLinear()
        .domain([d3.min(weatherData, d => d[chosenYAxisWeather] * 0.7), d3.max(weatherData, d => d[chosenYAxisWeather]) * 1.2])
        .range([chartHeightTR, 0]);
  }
  return yLinearScaleTR;
}

function renderAxesTR(newyScaleTR, yAxisTR) {
  var leftAxisTR = d3.axisLeft(newyScaleTR);

  yAxisTR.transition()
      .duration(1000)
      .call(leftAxisTR);

  return yAxisTR;
}

// update rectangles group with transition
function renderRectanglesTR(rectanglesGroup, newyScaleTR, chosenYAxisWeather) {
  rectanglesGroup.transition()
      .duration(1000)
      .attr("y", d => newyScaleTR(d[chosenYAxisWeather]))
      .attr("height", d => chartHeightTR - newyScaleTR(d[chosenYAxisWeather]));

  return rectanglesGroup;
}

// Set up Tool Tip
function updateWeatherToolTip(chosenYAxisWeather, rectanglesGroup) {
  var labelTR;

  if (chosenYAxisWeather === "avg_annual_temp") {
      labelTR = "Avg Annual Temp:";
  }
  else {
      labelTR = "Avg Annual Rainfall:";
  }
  var toolTipTR = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function(d, i) {
          return(`
          Year: ${d.year}<br>
          ${labelTR} ` + formatDecimal(d[chosenYAxisWeather])
          );
      });

  rectanglesGroup.call(toolTipTR);

  rectanglesGroup.on("mouseover", function(d, i) {
      toolTipTR.show(d, this);
  })
      .on("mouseout", function(data, index) {
          toolTipTR.hide(data);
      });

  return rectanglesGroup;
}

//Retrieving data from api url
d3.json(tempRain_url).then((data, err) => {
    if (err) throw err;
    console.log(data);

    var weatherData = data.result;

    // Parse data and cast as numbers.
    weatherData.forEach((data) => {
        data.year = +data.year;
        data.avg_annual_temp = +data.avg_annual_temp;
        data.avg_annual_rainfall = +data.avg_annual_rainfall;
        data.temp_difference = +data.temp_difference;
        data.rainfall_difference = +data.rainfall_difference;
      });
    
    var year = weatherData.map(d => d.year);

    // Configure a x scale for the horizontal axis
    var xScaleTR = d3.scaleBand()
        .domain(year)
        .range([0, chartWidthTR])
        .paddingInner(0.1);

    // Create a linear scale for the y axis.
    var yLinearScaleTR = yWeatherScale(weatherData, chosenYAxisWeather);

    // Create the chart's axes
    var xAxisTR = d3.axisBottom(xScaleTR);
    var yAxisTR = d3.axisLeft(yLinearScaleTR);

    // Append two SVG group elements to the chartGroup area,
    // and create the bottom and left axes inside of them
    chartGroupTR.append("g")
      .style("font", "24px")
      .attr("transform", `translate(0, ${chartHeightTR})`)
      .call(xAxisTR)
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", function(d) {
            return "rotate(-65)" 
            });

    var leftAxisTR = chartGroupTR.append("g")
        .call(yAxisTR);

    // Create one SVG rectangle per piece of weather data
    // Use the linear and band scales to position each rectangle within the chart
    var rectanglesGroup = chartGroupTR.selectAll("rect")
        .data(weatherData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (d, i) => xScaleTR(year[i]))
        .attr("y", (d, i) => yLinearScaleTR(d[chosenYAxisWeather]))
        .attr("width", xScaleTR.bandwidth())
        .attr("height", d => chartHeightTR - yLinearScaleTR(d[chosenYAxisWeather]))
        .attr("opacity", 0.75);

      // Two y axis labels
      var labelsGroupTR = chartGroupTR.append("g")
          .attr("transform", "rotate(-90)");

      var tempLabel = labelsGroupTR.append("text")
          .attr("y", 0 - chartMargin.left + 65)
          .attr("x", 0 - (chartHeightTR / 2))
          .attr("value", "avg_annual_temp")
          .classed("active", true)
          .text("Avg Annual Temperature (Celsius)");

      var rainLabel = labelsGroupTR.append("text")
          .attr("y", 0 - chartMargin.left + 25)
          .attr("x", 0 - (chartHeightTR / 2))
          .attr("value", "avg_annual_rainfall")
          .classed("inactive", true)
          .text("Avg Annual Rainfall (ml)");

   //append x axis label
    chartGroupTR.append("text")
      .attr("transform", `translate(${chartWidthTR / 2}, ${chartHeightTR + chartMargin.top + 30})`)
      .attr("x", 0)
      .attr("y", 20)
      .classed("active", true)
      .text("Year");

    // updateWeatherToolTip 
    var rectanglesGroup = updateWeatherToolTip(chosenYAxisWeather, rectanglesGroup);

    // y axis label event listener
    labelsGroupTR.selectAll("text")
        .on("click", function() {
            // get value of section
            var valueTR = d3.select(this).attr("value");
            if (valueTR != chosenYAxisWeather) {
                chosenYAxisWeather = valueTR;
                console.log(chosenYAxisWeather);

                yLinearScaleTR = yWeatherScale(weatherData, chosenYAxisWeather);

                leftAxisTR = renderAxesTR(yLinearScaleTR, leftAxisTR);

                rectanglesGroup = renderRectanglesTR(rectanglesGroup, yLinearScaleTR, chosenYAxisWeather);

                rectanglesGroup = updateWeatherToolTip(chosenYAxisWeather, rectanglesGroup, year);

                // changes classes to change bold text for active/selected label
                if (chosenYAxisWeather === "avg_annual_temp") {
                    tempLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    rainLabel
                        .classed("acitve", false)
                        .classed("inactive", true);
                }
                else if (chosenYAxisWeather === "avg_annual_rainfall") {
                    tempLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    rainLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
}).catch(function(error) {
console.log(error);
});