// Set up the chart.
const frpSvgWidth = 1000;
const frpSvgHeight = 600;

const frpMargin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 50
};

const frpWidth = frpSvgWidth - frpMargin.left - frpMargin.right;
const frpHeight = frpSvgHeight - frpMargin.top - frpMargin.bottom;

// Create an SVG wrapper,
// append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
const frpSvg = d3.select("#fire-power-chart")
  .append("svg")
  .attr("class", "svg")
  .attr("id", "fire-power-svg")
  .attr("viewBox", `0 0 ${frpSvgWidth} ${frpSvgHeight}`)

const frpChartGroup = frpSvg.append("g")
  .attr("transform", `translate(${frpMargin.left}, ${frpMargin.top})`);

// Import data from the time series endpoint.
const frp_time_series_url = `${api_base_url}/fires_time_series`;

d3.json(frp_time_series_url).then(function (data) {
  const frpParseTime = d3.timeParse("%Y-%m-%d");

  // Format the data.
  data.result.forEach(function (fire) {
    fire.acq_date = frpParseTime(fire.x);
    fire.avg_brightness = +fire.avg_brightness;
    fire.avg_frp = +fire.avg_frp;
  });

  // Create scales.
  const frpXTimeScale = d3.scaleTime()
    .domain(d3.extent(data.result, d => d.acq_date))
    .range([0, frpWidth]);

  const frpYLinearScale = d3.scaleLinear()
    .domain([0, d3.max(data.result, d => d.avg_frp)])
    .range([frpHeight, 0]);

  const brightnessYLinearScale = d3.scaleLinear()
    .domain([0, d3.max(data.result, d => d.avg_brightness)])
    .range([frpHeight, 0]);

  // Create axes.
  const frpBottomAxis = d3.axisBottom(frpXTimeScale).tickFormat(d3.timeFormat("%d-%b"));
  const frpLeftAxis = d3.axisLeft(frpYLinearScale);
  const brightnessRightAxis = d3.axisRight(brightnessYLinearScale);


  // Append the axes to the chart group.
  // Add bottomAxis
  frpChartGroup.append("g").attr("transform", `translate(0, ${frpHeight})`).call(frpBottomAxis);

  // Add left axis to the left side of the display.
  frpChartGroup.append("g").call(frpLeftAxis).attr("stroke", "#7AC142")

  // Add right axis to the right side of the display.
  frpChartGroup.append("g").attr("transform", `translate(${frpWidth}, 0)`).call(brightnessRightAxis).attr("stroke", "orangered")


  // Set up two line generators and append two SVG paths.
  // Line generators for each line.
  const frpLine = d3
    .line()
    .x(d => frpXTimeScale(d.acq_date))
    .y(d => frpYLinearScale(d.avg_frp));

  const brightnessLine = d3
    .line()
    .x(d => frpXTimeScale(d.acq_date))
    .y(d => brightnessYLinearScale(d.avg_brightness));

  // Append a path for frpLine.
  frpChartGroup.append("path")
    .data([data.result])
    .attr("d", frpLine)
    .classed("line avg-frp-line", true);

  // Append a path for brightnessLine.
  frpChartGroup.append("path")
    .data([data.result])
    .attr("d", brightnessLine)
    .classed("line avg-brightness-line", true)

  // Add text below the x-axis.
  frpChartGroup.append("text")
    .attr("transform", `translate(${frpWidth / 2}, ${frpHeight + frpMargin.top + 25})`)
    .attr("text-anchor", "middle")
    .attr("font-size", "16px")
    .attr("font-weight", "bold")
    .attr("fill", "#7AC142")
    .text("Average Intensity in MW (megawatts) (or FRP - Fire Radiative Power)");

  frpChartGroup.append("text")
    .attr("transform", `translate(${frpWidth / 2}, ${frpHeight + frpMargin.top + 55})`)
    .attr("text-anchor", "middle")
    .attr("font-size", "16px")
    .attr("font-weight", "bold")
    .attr("fill", "orangered")
    .attr("padding-top", "30px")
    .text("Average Brightness Temperature (Kelvin)");
  ;

}).catch(function (error) {
  console.log(error);
});

d3.select("#download-firepower-chart")
  .on("click", () => {
    saveSvgAsPng(document.getElementById("fire-power-svg"), "average_fire_temperature_intensity.png", { backgroundColor: '#fff' });
  });