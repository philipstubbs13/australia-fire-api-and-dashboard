// svg params
var svgbystateWidth = 900;
var svgbystateHeight = 450;

// margins
var marginbystate = {
  top: 10,
  right: 40,
  bottom: 110,
  left: 160
};

// chart area minus margins
var bystatechartWidth = svgbystateWidth - marginbystate.left - marginbystate.right;
var bystatechartHeight = svgbystateHeight - marginbystate.top - marginbystate.bottom;

// endpoint to pull data from
var bystate_url = `${api_base_url}/fires_bystate`;

// create svg container within my chart id
var svgbystate = d3.select("#bushfire-devastation-chart")
    .append("svg")
    .attr("width", bystatechartWidth)
    .attr("height", bystatechartHeight);

// shift everything over by the margins
var chartGroup = svgbystate.append("g")
    .attr("transform", `translate(${marginbystate.left}, ${marginbystate.top})`);

  // Retrieve data from the api endpoint and execute everything below.
d3.json(bystate_url).then((data, err) => {
    if (err) throw err;

    console.log(data);

    // Parse data/cast as numbers.
    data.result.forEach((data) => {
        data.fatalities = +data.fatalities;
        data.homeslost = +data.homeslost;
        data.area_burned_ha = +data.area_burned_ha;

    // scale y to chart height
    // need to make this dynamic but have a preset chart
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(data.area_burned_ha)])
        .range([bystatechartHeight, 0]);

    // scale x to chart width
    var xScale = d3.scaleBand()
        .domain(data.state)
        .range([0, bystatechartWidth])
        .padding(0.1);

    // create axes
    var xAxis = d3.axisLeft(yScale);
    var yAxis = d3.axisBottom(xScale);

    // set x to the bottom of the chart
    chartGroup.append("g")
        .attr("transform", `translate(0, ${bystatechartHeight})`)
        .call(xAxis);

    // set y to the left axis
    chartGroup.append("g")
        .call(yAxis);

    // create the bar chart
    chartGroup.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.area_burned_ha))
        .attr("y", d => yScale(d.state))
        .attr("width", xScale.bandwidth())
        .attr("height", d => bystatechartHeight - yScale(d))
        .attr("fill", "pink")
    
    });
});
