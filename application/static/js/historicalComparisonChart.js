const svgWidth = 900;
const svgHeight = 450;

const margin = {
  top: 10,
  right: 40,
  bottom: 110,
  left: 160
};

const axisLabels = {
  area_burned_acres: 'area_burned_acres',
  fatalities: 'fatalities',
  homes_destroyed: 'homes_destroyed',
  year: 'year'
}

const fireSeason201920 = "2019–20 Australian bushfire season";

const chartWidth = svgWidth - margin.left - margin.right;
const chartHeight = svgHeight - margin.top - margin.bottom;

const api_url = `${api_base_url}/fires_historical`;

const historicalChartSvg = "historical-chart-svg"

// Function to populate select dropdown with options.
const populateFireSelectDropdown = (options, selectElement) => {
  selectElement
    .append('option')
    .attr('value', '')
    .text('');
  options.forEach(option =>
    selectElement
      .append('option')
      .attr('value', option.id)
      .text(option.name),
  );
};

const drawHistoricalComparisonChart = () => {

  // Choose the initial x-axis and y-axis to display.
  let chosenXAxis = axisLabels.year;
  let chosenYAxis = axisLabels.area_burned_acres;

  // Create an SVG wrapper, append an SVG group that will hold the chart,
  // and shift by left and top margins.
  const svg = d3.select("#historical-comparison-chart")
    .append("svg")
    .attr("class", "svg")
    .attr("id", historicalChartSvg)
    .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)

  // Append an SVG group.
  const chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Legend text
  chartGroup.append("text")
    .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + margin.top + 60})`)
    .attr("text-anchor", "middle")
    .attr("font-size", "16px")
    .attr("fill", "orangered")
    .html(fireSeason201920);

  // Legend text
  chartGroup.append("text")
    .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + margin.top + 90})`)
    .attr("text-anchor", "middle")
    .attr("font-size", "16px")
    .attr("fill", "black")
    .html("Fires before 2019-20 season");

  // Legend icon
  chartGroup.append("circle")
    .attr("transform", `translate(${chartWidth / 2 - 195}, ${chartHeight + 15})`)
    .attr("cx", 50)
    .attr("cy", 50)
    .attr("r", "7")
    .attr("stroke", "orangered")
    .attr("stroke-width", "5")
    .attr("fill", "orangered")
    .attr("opacity", "0.6")

  // Legend icon
  chartGroup.append("circle")
    .attr("transform", `translate(${chartWidth / 2 - 195}, ${chartHeight + 42})`)
    .attr("cx", 50)
    .attr("cy", 50)
    .attr("r", "7")
    .attr("stroke", "black")
    .attr("stroke-width", "5")
    .attr("fill", "black")
    .attr("opacity", "0.6")


  // Retrieve data from the api endpoint and execute everything below.
  d3.json(api_url).then((data, err) => {
    if (err) throw err;

    // Parse data/cast as numbers.
    data.result.forEach((data) => {
      data.area_burned_acres = +data.area_burned_acres;
      data.fatalities = +data.fatalities;
      data.homes_destroyed = +data.homes_destroyed;
    });

    // State to hold the values of the user input fields.
    let inputValues = {
      historicalFire: '',
    };

    // Get the keys of the input elements.
    const inputKeys = Object.keys(inputValues);

    // Set attributes and styling for the select dropdown elements.
    d3.select('.historical-chart-filters').selectAll('select').each(function (d, i) {
      this.setAttribute('class', 'form-control');
      this.setAttribute('id', inputKeys[i])
      this.setAttribute('name', inputKeys[i]);
    });

    // Get select elements
    const historicalChartFireSelect = d3.select("#historicalFire");

    // Populate dropdown with list of fires.
    populateFireSelectDropdown(data.result, historicalChartFireSelect);

    // Display 2019-20 Australia Fire by default
    let singleFireContainer = d3.select('.single-fire-container');
    const fire2019Stats = data.result.find(fire => fire.name === fireSeason201920)
    Object.entries(fire2019Stats).forEach(([key, value]) => {
      if (key !== "id") {
        singleFireContainer.append('p')
          .html(`
            <span class="font-weight-bold">${key.replace(/_/g, ' ')}: 
            <span class="font-weight-normal" style="font-size: 16px">${value != null ? value : 'Info Not Available'}</span>
            <br>
        `)
          .style("margin-top", "10px")
      }
    })

    // Function that gets fired when value of input changes.
    d3.select('#historicalFire').on('change', function (event) {
      const fireToDisplay = data.result.find(fire => fire.id === d3.event.target.value)
      singleFireContainer.html('');
      Object.entries(fireToDisplay).forEach(([key, value]) => {
        if (key !== "id" && key !== "name") {
          singleFireContainer.append('p')
            .html(`
            <span class="font-weight-bold">${key.replace(/_/g, ' ')}: 
            <span class="font-weight-normal" style="font-size: 16px">${value != null ? value : 'Info Not Available'}</span>
            <br>
        `)
            .style("margin-top", "10px")
        }
      });

      (inputValues[d3.event.target.name] = d3.event.target.value)
    });

    // Create scale functions.
    let xTimeScale = xScale(data, chosenXAxis, chartWidth);
    let yLinearScale = yScale(data, chosenYAxis, chartHeight);

    // Create initial axis functions.
    const bottomAxis = d3.axisBottom(xTimeScale).tickFormat(d3.format("y"))
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
      .attr("cx", d => xTimeScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", (d, i) => {
        if (d.name === fireSeason201920) {
          return "12"
        } else {
          return "9"
        }
      })
      .attr("fill", (d, i) => {
        if (d.name === fireSeason201920) {
          return "orangered"
        } else {
          return "black"
        }
      })
      .attr("opacity", ".6")


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
    const areaBurnedAcresLabel = createYAxisLabel(yaxisLabelsGroup, margin, 65, chartHeight, axisLabels.area_burned_acres, "active", true, "Area Burned (Acres)");

    const fatalitiesLabel = createYAxisLabel(yaxisLabelsGroup, margin, 45, chartHeight, axisLabels.fatalities, "inactive", true, "Fatalities");

    const homesDestroyedLabel = createYAxisLabel(yaxisLabelsGroup, margin, 25, chartHeight, axisLabels.homes_destroyed, "inactive", true, "Homes Destroyed");

    // Create/update tooltip for each circle in the circles group.
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);


    // Event listener for when y-axis label is clicked.
    yaxisLabelsGroup.selectAll("text")
      .on("click", function () {
        // Get value of selection.
        const value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {

          // Replaces chosenYAxis with value.
          chosenYAxis = value;

          // Updates y scale for new data.
          let yLinearScale = yScale(data, chosenYAxis, chartHeight);

          // Updates y-axis with transition.
          yAxis = renderYAxis(yLinearScale, yAxis);

          // Updates circles with new y values.          
          circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);

          // Updates tooltips with new info.
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

          // Change classes to change bold text for y-axis labels.
          switch (chosenYAxis) {
            case axisLabels.homes_destroyed:
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
            case axisLabels.fatalities:
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
            case axisLabels.area_burned_acres:
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
  }).catch((error) => console.error(error));
}

// Function used for setting the x-axis scale.
const xScale = (data, chosenXAxis, chartWidth) => {
  const xTimeScale = d3.scaleTime()
    .domain(d3.extent(data.result, function (d) {
      return d[chosenXAxis];
    }))
    .range([0, chartWidth]);

  return xTimeScale;
}

// Function used to create y-axis label.
const createYAxisLabel = (yaxisLabelsGroup, margin, y, chartHeight, value, activeClass, active, text) => {
  const label = yaxisLabelsGroup.append("text")
    .attr("y", 0 - margin.left + y)
    .attr("x", 0 - (chartHeight / 2))
    .attr("dy", "1em")
    .attr("value", value)
    .classed(activeClass, active)
    .text(text);

  return label;
}

// Function used for setting y-axis scale.
const yScale = (data, chosenYAxis, chartHeight) => {
  // create scales
  let yLinearScale = d3.scaleLinear()
    .domain([d3.min(data.result, d => d[chosenYAxis]), d3.max(data.result, d => d[chosenYAxis])])
    .range([chartHeight, 0]);

  return yLinearScale;
}

// Function used for updating y-axis when clicking on the y-axis label.
const renderYAxis = (newYScale, yAxis) => {
  const leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// Function used for updating circles group with a transition to new circles.
const renderCircles = (circlesGroup, newYScale, chosenYAxis) => {
  circlesGroup.transition()
    .duration(2000)
    .attr("cy", d => newYScale(d[chosenYAxis]))

  return circlesGroup;
}

// Function used to determine which y-axis label to display inside the tooltip.
const chooseYLabel = (chosenYAxis) => {
  switch (chosenYAxis) {
    case axisLabels.area_burned_acres:
      return "Area Burned (Acres):";
    case axisLabels.fatalities:
      return "Fatalities:";
    case axisLabels.homes_destroyed:
      return "Homes Destroyed:";
    default:
      return "Area Burned (Acres):";
  }
}

// Function used for updating circles group with new tooltip.
const updateToolTip = (chosenXAxis, chosenYAxis, circlesGroup) => {

  const xLabel = "Year:";

  const yLabel = chooseYLabel(chosenYAxis);

  const numberFormat = d3.format(",");

  const toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html((d) => {
      return (`
        ${d.name}<br>
        ${xLabel} ${d[chosenXAxis]}<br>
        ${yLabel} ${numberFormat(d[chosenYAxis])}<br>
      `);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function (d) {
    toolTip.show(d, this);
    d3.select(this)
      .transition()
      .duration(1000)
      .attr("r", 20)
  })
    .on("mouseout", function (data, index) {
      toolTip.hide(data);
      d3.select(this)
        .transition()
        .duration(1000)
        .attr("r", (d, i) => {
          if (d.name === fireSeason201920) {
            return "12"
          } else {
            return "9"
          }
        })
    });

  return circlesGroup;
}

drawHistoricalComparisonChart();

d3.select("#download-historical-chart")
  .on("click", () => {
    saveSvgAsPng(document.getElementById(historicalChartSvg), "historical_fires.png", { backgroundColor: '#fff' });
  });
