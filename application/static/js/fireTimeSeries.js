// State to hold the values of the user input/select fields.
let inputValues = {
  // time: 'All',
  // satellite: 'All',
  startDate: 'All',
  endDate: 'All',
};

// Get the keys of the input elements.
const inputKeys = Object.keys(inputValues);

// Set attributes and styling for the select dropdown elements.
d3.select(".chart-filters").selectAll('select').each(function (d, i) {
  this.setAttribute('style', 'height:auto;');
  this.setAttribute('class', 'form-control');
  this.setAttribute('style', 'width: 100%');
  this.setAttribute('id', inputKeys[i + 1]);
});

// HTML select elements
const timeSelect = d3.select('#time');
const satelliteSelect = d3.select('#satellite');

// Use the input keys to set the name attribute for each input element.
d3.select(".chart-filters").selectAll('.form-control').each(function (d, i) {
  this.setAttribute('name', inputKeys[i]);
});

// Function that gets fired when value of input changes.
d3.select(".chart-filters").selectAll('.form-control').on('change', function (event) {
  (inputValues[d3.event.target.name] = d3.event.target.value)
  buildTimeSeries();
});

const buildTimeSeries = () => {
  const filterValues = Object.values(inputValues);
  // let time = filterValues[0];
  // let satellite = filterValues[1];
  let startDate = filterValues[0];
  let endDate = filterValues[1];

  // Build query url for retrieving data from api.
  let time_series_api_url = `${api_base_url}/fires_time_series`;
  time_series_api_url = `${time_series_api_url}?start_date=${startDate}&end_date=${endDate}`

  // Insert div for loading state.
  d3.select(".time-series-column").append("div").attr("id", "loading-time-series")
  // Remove previous div (if one already exists).
  d3.selectAll("#fires-time-series-chart").remove()
  // Begin loading.
  d3.select("#loading-time-series")
    .html(`
    <div class="text-center">
      <h4 class='text-center mt-5' > Loading chart...</h4>
      <div class="spinner-border spinner-border-lg text-center mt-3" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
    `)

  d3.json(time_series_api_url).then((data, err) => {
    if (err) {
      // Stop loading and throw error.
      d3.select("#loading-time-series").remove()
      throw err;
    }

    // stop loading.
    d3.select("#loading-time-series").remove()

    // Insert div for time series chart.
    d3.select(".time-series-column").append("div").attr("id", "fires-time-series-chart")

    // Convert dates to javascript date objects.
    data.result.forEach(point => {
      point.x = new Date(point.x);
    })

    // Format time on the time series chart.
    const locale = d3.timeFormatLocale({
      "dateTime": "%a %e %b %Y %X",
      "date": "%d-%m-%Y",
      "time": "%I:%M%p",
      "periods": ["am", "pm"],
      "days": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "shortDays": ["Sun", "Mon", "Tues", "Wed", "Thu", "Fri", "Sat"],
      "months": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      "shortMonths": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    })


    // Function to format time on the x-axis of the time series chart.
    const timeFormat = (date) => {
      return (
        d3.timeDay(date) < date ? locale.format("%I:%M%p") :
          d3.timeMonth(date) < date ? locale.format("%m/%d") :
            d3.timeYear(date) < date ? locale.format("%B") :
              d3.timeFormat("%Y")
      )(date)
    }

    const timeSeriesChart = d3_timeseries()
      .addSerie(data.result, { x: 'x', y: 'y' }, { interpolate: 'linear', color: "orangered", label: 'Number of Fires' })
      .width(600)
      .xscale.tickFormat(timeFormat)
      .margin.left(35)
      .margin.right(40)
      .height(400)

    timeSeriesChart('#fires-time-series-chart')
  })
}

buildTimeSeries();

d3.select("#download-time-series-chart")
  .on("click", () => {
    saveSvgAsPng(document.querySelector("#fires-time-series-chart svg"), "fires_time_series.png", { backgroundColor: '#fff' });
  });

