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

// shift everything over by the margins
var chartGroup = svgbystate.append("g")
    .attr("transform", `translate(${marginbystate.left}, ${marginbystate.top})`);

var chosenYAxis = "area_burned_ha";

// scale x to chart width
function yDevastationScale(filteredData, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(filteredData, d => d[chosenYAxis]) * 1.2])
        .range([bystatechartHeight, 0]);

    return yLinearScale;
}

function renderAxes(newyScale, yAxis) {
    var leftAxis = d3.axisLeft(newyScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// update rectangles group with transition
function renderRectangles(rectGroup, newyScale, chosenYAxis) {
    rectGroup.transition()
        .duration(1000)
        .attr("y", d => newyScale(d[chosenYAxis]))
        .attr("height", d => bystatechartHeight - newyScale(d[chosenYAxis]));

    return rectGroup;
}

// d3 tool tip
function updateDevastationToolTip(chosenYAxis, rectGroup) {
    var label;

    if (chosenYAxis === "area_burned_ha") {
        label = "Area Burned (hectares):";
    }
    else if (chosenYAxis === "homeslost") {
        label = "Homes Lost:";
    }
    else {
        label = "Fatalities:";
    }
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function(d, i) {
            return(`
            State: ${d.state}<br>
            ${label} ${d[chosenYAxis]}
            `);
        });

    rectGroup.call(toolTip);

    rectGroup.on("mouseover", function(d, i) {
        toolTip.show(d, this);
    })
        .on("mouseout", function(data, index) {
            toolTip.hide(data);
        });

    return rectGroup;
}

  // Retrieve data from the api endpoint and execute everything below.
d3.json(bystate_url).then((data, err) => {
    if (err) throw err;

    console.log(data);
    
    // add a JS.filter() to remove the last row of total of all results
    filteredData = data.result.filter(d => d.state != 'Total');
    console.log(filteredData.map(d => d.state));

    // Parse data/cast as numbers.
    filteredData.forEach((data) => {
        data.fatalities = +data.fatalities;
        data.homeslost = +data.homeslost;
        data.area_burned_ha = +data.area_burned_ha;
    });

    // create variables for each data set
    var state = filteredData.map(d => d.state);

    var xScale = d3.scaleBand()
        .domain(state)
        .range([0, bystatechartWidth])
        .padding(0.1);

    var xAxis = d3.axisBottom(xScale);

    var yLinearScale = yDevastationScale(filteredData, chosenYAxis);
    var yAxis = d3.axisLeft(yLinearScale);

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
    var leftAxis = chartGroup.append("g")
        .call(yAxis);
    
    // append initial rectangles
    var rectGroup = chartGroup.selectAll("rect")
        .data(filteredData)
        .enter()
        .append("rect")
        .attr("x", (d, i) => xScale(state[i]))
        .attr("y", (d, i) => yLinearScale(d[chosenYAxis]))
        .attr("width", xScale.bandwidth())
        .attr("height", d => bystatechartHeight - yLinearScale(d[chosenYAxis]))
        .attr("opacity", 0.75);

    // 3 y axis labels
    var labelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)");

    var areaLabel = labelsGroup.append("text")
        .attr("y", 0 - marginbystate.left + 65)
        .attr("x", 0 - (bystatechartHeight / 2))
        .attr("value", "area_burned_ha")
        .classed("active", true)
        .text("Area Burned (hectares)");

    var homesLabel = labelsGroup.append("text")
        .attr("y", 0 - marginbystate.left + 25)
        .attr("x", 0 - (bystatechartHeight / 2))
        .attr("value", "homeslost")
        .classed("inactive", true)
        .text("Homes Destroyed");

    var fatalitiesLabel = labelsGroup.append("text")
        .attr("y", 0 - marginbystate.left + 45)
        .attr("x", 0 - (bystatechartHeight / 2))
        .attr("value", "fatalities")
        .classed("inactive", true)
        .text("Fatalities");  

    // append x axis label
    chartGroup.append("text")
        .attr("transform", `translate(${bystatechartWidth / 2}, ${bystatechartHeight + 80})`)
        .attr("x", 0)
        .attr("y", 20)
        .classed("active", true)
        .text("State");

    // updateDevastationToolTip from function above on json import
    var rectGroup = updateDevastationToolTip(chosenYAxis, rectGroup);

    // y axis label event listener
    labelsGroup.selectAll("text")
        .on("click", function() {
            // get value of section
            var value = d3.select(this).attr("value");
            if (value != chosenYAxis) {
                chosenYAxis = value;
                console.log(chosenYAxis);

                yLinearScale = yDevastationScale(filteredData, chosenYAxis);

                leftAxis = renderAxes(yLinearScale, leftAxis);

                rectGroup = renderRectangles(rectGroup, yLinearScale, chosenYAxis);

                rectGroup = updateDevastationToolTip(chosenYAxis, rectGroup, state);

                // chages classes to change bold text
                if (chosenYAxis === "area_burned_ha") {
                    areaLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    homesLabel
                        .classed("acitve", false)
                        .classed("inactive", true);
                    fatalitiesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenYAxis === "homeslost") {
                    areaLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    homesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    fatalitiesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    areaLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    homesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    fatalitiesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
});

