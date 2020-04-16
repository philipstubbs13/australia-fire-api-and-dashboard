/*do not need to redefine chart width and height as it is found in another js file & 
want it to be the same size*/

// Define SVG area dimensions
/*var svgWidth = 1400;
var svgHeight = 660;*/

// Define the chart's margins as an object
var chartMargin = {
  top: 10,
  right: 40,
  bottom: 110,
  left: 160
};

// Define dimensions of the chart area
/*var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;*/

// Select chart id, append SVG area to it, and set the dimensions
var svgTR = d3.select("#temp-rain-chart")
  .append("svg")
  .attr("height", svgHeight)
  .attr("width", svgWidth)
  //.attr("class", "bar-chart");//bar-chart class for styling in CSS

// Append a group to the SVG area and shift ('translate') it to the right and down
var chartGroupTR = svgTR.append("g")
  .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

// Initial Params
//var chosenXAxisWeather = "year";
//var chosenYAxisWeather = "avg_annual_temp";

//URL
var tempRain_url = `${api_base_url}/aus_temp_rainfall`;
console.log(tempRain_url);

//Retrieving data from api url
d3.json(tempRain_url).then((weatherData, err) => {
    if (err) throw err;
    console.log(weatherData);

    // Parse data/cast as numbers.
    weatherData.result.forEach((data) => {
        data.year = +data.year;
        data.avg_annual_temp = +data.avg_annual_temp;
        data.avg_annual_rainfall = +data.avg_annual_rainfall;
        data.temp_difference = +data.temp_difference;
        data.rainfall_difference = +data.rainfall_difference;
      });
    
    var year = weatherData.result.map(d => d.year);
      console.log(year);

    var avg_annual_temp = weatherData.result.map(d => d.avg_annual_temp);
      console.log(avg_annual_temp);

     // Configure a band scale for the horizontal axis
    var xBandScaleTR = d3.scaleBand()
        .domain(d3.extent((d, i) => year[i]))
        .range([0, chartWidth])
        .paddingInner(0.1);

    // Create a linear scale for the vertical axis. Extent gives min and max as limits
    var yLinearScaleTR = d3.scaleLinear()
        .domain([0, d3.max((d, i) => avg_annual_temp[i])])
        .range([chartHeight,0]);

    // These will be used to create the chart's axes
    var bottomAxisTR = d3.axisBottom(xBandScaleTR);
    var leftAxisTR = d3.axisLeft(yLinearScaleTR);

    // Append two SVG group elements to the chartGroup area,
    // and create the bottom and left axes inside of them
    chartGroupTR.append("g")
        .call(leftAxisTR);

    chartGroupTR.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(bottomAxisTR);

    // Create one SVG rectangle per piece of weather data
    // Use the linear and band scales to position each rectangle within the chart
    var rectanglesGroup = chartGroupTR.selectAll(".bar")
        .data(weatherData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (d, i) => xBandScaleTR(year[i]))
        .attr("y", (d, i) => yLinearScaleTR(d))
        .attr("width", xBandScaleTR.bandwidth())
        .attr("height", d => chartHeight - yLinearScaleTR(d))

        console.log(rectanglesGroup);

    // Create axes labels
    chartGroupTR.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - chartMargin.left + 40)
      .attr("x", 0 - (chartHeight/2))
      .attr("dy", "1em")
      .attr("class", "axisText")
      .text("Avg Annual Temperature");

    chartGroupTR.append("text")
      .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + chartMargin.top + 30})`)
      .attr("class", "axisText")
      .text("Year")
      /*.selectAll("text")	
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(65)");*/

    //Initialize Tooltip
    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d) {
        return (`<strong>${d.year}<strong><hr>${d.avg_annual_temp}`);
        });
  
    //Create the tooltip in chartGroup.
    chartGroupTR.call(toolTip);
  
    // Create "mouseover" event listener to display tooltip
    rectanglesGroup.on("mouseover", function(d) {
        toolTip.show(d, this);
        })

    // Create "mouseout" event listener to hide tooltip
        .on("mouseout", function(d) {
            toolTip.hide(d);
          });


}).catch(function(error) {
console.log(error);
});