const time_series_api_url = `${api_base_url}/fires_time_series`;

d3.json(time_series_api_url).then((data, err) => {
  if (err) throw err;

  data.result.forEach(point => {
    point.x = new Date(point.x);
  })

  const timeSeriesChart = d3_timeseries()
    .addSerie(data.result, { x: 'x', y: 'y' }, { interpolate: 'linear', color: "orangered", label: 'Number of Fires' })
    .width(1000)
    .margin.left(210)
    .margin.right(40)

  timeSeriesChart('#fires-time-series-chart')
})

