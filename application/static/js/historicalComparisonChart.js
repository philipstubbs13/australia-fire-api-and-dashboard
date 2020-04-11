const svgWidth = 1000;
const svgHeight = 600;

const margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 190
};

const axisLabels = {
  area_burned_acres: 'area_burned_acres',
  fatalities: 'fatalities',
  homes_destroyed: 'homes_destroyed',
  year: 'year'
}

const chartWidth = svgWidth - margin.left - margin.right;
const chartHeight = svgHeight - margin.top - margin.bottom;

const url = `${api_base_url}/fires_historical`;

const drawChart = () => {

  // Choose the initial x-axis and y-axis to display.
  let chosenXAxis = axisLabels.year;
  let chosenYAxis = axisLabels.area_burned_acres;

  // Create an SVG wrapper, append an SVG group that will hold the chart,
  // and shift the latter by left and top margins.
  const svg = d3.select("#historical-comparison-chart")
    .append("svg")
    .attr("class", "svg")
    .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
  // using viewBox is what makes the svg/chart responsive:
  // https://medium.com/@louisemoxy/a-simple-way-to-make-d3-js-charts-svgs-responsive-7afb04bc2e4b


  // Append an SVG group.
  const chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Retrieve data from the api endpoint and execute everything below.
  d3.json(url).then((data, err) => {
    if (err) throw err;

    // Parse data/cast as numbers.
    data.result.forEach((data) => {
      data.area_burned_acres = +data.area_burned_acres;
      data.fatalities = +data.fatalities;
      data.year = +data.year;
      data.homes_destroyed = +data.homes_destroyed;
    });

    console.log(data.result)

    // Create scale functions.
    let xLinearScale = d3.scaleLinear()
      .domain([d3.min(data.result, d => d[chosenXAxis]), d3.max(data.result, d => d[chosenXAxis])])
      .range([0, chartWidth]);
    let yLinearScale = d3.scaleLinear()
      .domain(d3.extent(data.result, d => d[chosenYAxis]))
      .range([chartHeight, 0]);

    // Create initial axis functions.
    const bottomAxis = d3.axisBottom(xLinearScale);
    const leftAxis = d3.axisLeft(yLinearScale);

    // Append axes to the chart.
    let xAxis = chartGroup.append("g")
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(bottomAxis);

    let yAxis = chartGroup.append("g")
      .call(leftAxis);

    let circlesGroup = chartGroup.selectAll("circle")
      .data(data.result)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", "15")
      .attr("fill", "blue")
      .attr("opacity", ".5")

    // let circlesText = chartGroup.selectAll("text.text-circles")
    //   .data(data)
    //   .enter()
    //   .append("text")
    //   .classed("text-circles", true)
    //   .text(d => d.abbr)
    //   .attr("x", d => xLinearScale(d[chosenXAxis]))
    //   .attr("y", d => yLinearScale(d[chosenYAxis]))
    //   .attr("dy", 5)
    //   .attr("text-anchor", "middle")
    //   .attr("font-size", "10px")


    // Create group for x-axis labels.
    const xaxisLabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

    // Create the x-axis label.
    const yearLabel = xaxisLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", axisLabels.year)
      .classed("active", true)
      .text("Year");


    // Create group for y-axis labels.
    const yaxisLabelsGroup = chartGroup.append("g")
      .attr("transform", "rotate(-90)")

    // Create the y-axis labels.
    const areaBurnedAcresLabel = yaxisLabelsGroup.append("text")
      .attr("y", 0 - margin.left + 125)
      .attr("x", 0 - (chartHeight / 2))
      .attr("dy", "1em")
      .attr("value", axisLabels.area_burned_acres)
      .classed("active", true)
      .text("Area Burned (Acres)");

    const fatalitiesLabel = yaxisLabelsGroup.append("text")
      .attr("y", 0 - margin.left + 100)
      .attr("x", 0 - (chartHeight / 2))
      .attr("dy", "1em")
      .attr("value", axisLabels.fatalities)
      .classed("active", true)
      .text("Fatalities");

    const homesDestroyedLabel = yaxisLabelsGroup.append("text")
      .attr("y", 0 - margin.left + 75)
      .attr("x", 0 - (chartHeight / 2))
      .attr("dy", "1em")
      .attr("value", axisLabels.homes_destroyed)
      .classed("active", true)
      .text("Area Burned (Acres)");

    // Create/update tooltip for each circle in the circles group.
    // circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);


    // Event listener for when y-axis label is clicked.
    yaxisLabelsGroup.selectAll("text")
      .on("click", function () {
        // Get value of selection.
        const value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {

          // Replaces chosenYAxis with value.
          chosenYAxis = value;

          // Updates y scale for new data.
          yLinearScale = d3.scaleLinear()
            .domain(d3.extent(data.result, d => d[chosenYAxis]))
            .range([chartHeight, 0]);

          // Updates x-axis with transition.
          const yAxis = d3.axisLeft(yLinearScale);

          yAxis.transition()
            .duration(1000)
            .call(yAxis);

          // Updates circles with new x values.
          circlesGroup.transition()
            .duration(2000)
            .attr("cy", d => yLinearScale(d[chosenYAxis]))

          // Updates tooltips with new info.
          // circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

          // Updates circles text.
          // circlesText = renderCirclesText(circlesText, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

          // Change classes to change bold text for y-axis labels.
          switch (chosenYAxis) {
            case axisLabels.homesDestroyedLabel:
              homesDestroyedLabel
                .classed("active", true)
                .classed("inactive", false);
              fatalitiesLabel
                .classed("active", false)
                .classed("inactive", true);
              areaBurnedAcresLabel
                .classed("active", false)
                .classed("inactive", true);
              break;
            case axisLabels.fatalitiesLabel:
              homesDestroyedLabel
                .classed("active", false)
                .classed("inactive", true);
              fatalitiesLabel
                .classed("active", true)
                .classed("inactive", false);
              areaBurnedAcresLabel
                .classed("active", false)
                .classed("inactive", true);
              break;
            case axisLabels.areaBurnedAcresLabel:
              homesDestroyedLabel
                .classed("active", false)
                .classed("inactive", true);
              fatalitiesLabel
                .classed("active", false)
                .classed("inactive", true);
              areaBurnedAcresLabel
                .classed("active", true)
                .classed("inactive", false);
              break;
            default:
              homesDestroyedLabel
                .classed("active", true)
                .classed("inactive", false);
              fatalitiesLabel
                .classed("active", false)
                .classed("inactive", true);
              areaBurnedAcresLabel
                .classed("active", false)
                .classed("inactive", true);
          }
        }
      });
  }).catch((error) => console.log(error));
}

drawChart();
