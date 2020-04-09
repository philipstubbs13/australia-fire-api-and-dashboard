console.log(api_base_url);
const fires_modis_url = `${api_base_url}/fires_modis`;
const table = d3.select('#fires-modis-table');
const tableBody = table.select('tbody');

d3.json(fires_modis_url).then(data => {
  // Loop through the items in the data array.
  data.result.forEach(fire => {
    // Insert a row in the table at the last row
    let newRow = tableBody.append('tr');

    // Insert a cell in the row at index, create text nodes for each, append a text node to the cell
    Object.entries(fire).forEach(function([key, value]) {
      if (key !== 'id') {
        newRow.append('td').text(value.toString());
      }
    });
  });
});
