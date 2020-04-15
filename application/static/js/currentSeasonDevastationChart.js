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
    .attr("viewBox", `0 0 ${svgbystateWidth} ${svgbystateHeight}`);
    // .attr("width", bystatechartWidth)
    // .attr("height", bystatechartHeight);

// console.log(bystatechartWidth)

// shift everything over by the margins
var chartGroup = svgbystate.append("g")
    .attr("transform", `translate(${marginbystate.left}, ${marginbystate.top})`);

var chosenXAxis = "area_burned_ha";

// scale x to chart width
// may need to update how data is pulled here
function xScale(filteredData, chosenXAxis) {
    var xscaleBand = d3.scaleBand()
        .domain(filteredData, d => d[chosenXAxis])
        .range([0, bystatechartWidth])
        .padding(0.1);

    return xscaleBand;
}

// create axes
// var xAxis = d3.axisBottom(xScale);
function renderAxes(newxScale, xAxis) {
    var bottomAxis = d3.axisBottom(newxScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// update rectangles group with transition
// may need to update how data is pulled here
function renderRectangles(rectGroup, newxScale, chosenXAxis) {
    rectGroup.transition()
        .duration(1000)
        .attr("x", d => newxScale(d[chosenXAxis]));

    return rectGroup;
}

// d3 tool tip
function updateToolTip(chosenXAxis, rectGroup) {
    var label;

    if (chosenXAxis === "area_burned_ha") {
        label = "Area Burned (hectares):";
    }
    else if (chosenXAxis === "homeslost") {
        label = "Homes Lost:";
    }
    else {
        label = "Fatalities:";
    }
// may need to update how data is pulled here
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function(d) {
            return(`${d.state}<br>${label} ${d[chosenXAxis]}`);
        });

    rectGroup.call(toolTip);

    rectGroup.on("mouseover", function(data) {
        toolTip.show(data);
    })
        .on("mouseout", function(data, index) {
            toolTip.hid(data);
        });

    return rectGroup;
}

  // Retrieve data from the api endpoint and execute everything below.
d3.json(bystate_url).then((data, err) => {
    if (err) throw err;

    console.log(data);
    
    // add a JS.filter() to remove the last row of total of all results
    filteredData = data.result.filter(d => d.state != 'Total');
    console.log(filteredData);

    // Parse data/cast as numbers.
    filteredData.forEach((data) => {
        data.fatalities = +data.fatalities;
        data.homeslost = +data.homeslost;
        data.area_burned_ha = +data.area_burned_ha;
    });

    // use the xScale function above
    var xBanScale = xScale(filteredData.result, chosenXAxis);

    // create variables for each data set
    // var states = filteredData.map(d => d.state);
    // var burnarea = filteredData.map(d => d.area_burned_ha);

    // scale y to chart height
    // need to make this dynamic but have a preset chart
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(burnarea)])
        .range([bystatechartHeight, 0]);

    var yAxis = d3.axisLeft(yScale);





    // set x to the bottom of the chart
    chartGroup.append("g")
        .attr("transform", `translate(0, ${bystatechartHeight})`)
        .call(xAxis)
        .selectAll("text")	
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                return "rotate(-65)" 
                });

    // set y to the left axis
    chartGroup.append("g")
        .call(yAxis);
    
    // create the bar chart
    chartGroup.selectAll("rect")
        .data(burnarea)
        .enter()
        .append("rect")
        // .classed("")
        .attr("x", (d, i) => xScale(states[i]))
        .attr("y", (d, i) => yScale(burnarea[i]))
        .attr("width", d => xScale.bandwidth())
        .attr("height", d => bystatechartHeight - yScale(d));

    // axis labels
    chartGroup.append("text")
        .attr("transform", `translate(${bystatechartWidth / 2}, ${bystatechartHeight + 80})`)
        .attr("x", 0)
        .attr("y", 20)
        .classed("active", true)
        .text("State");

    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - marginbystate.left + 70)
        .attr("x", 0 - (bystatechartHeight / 2))
        .attr("dy", "1em")
        .classed("active", true)
        .text("Area Burned (hecares)")
});

