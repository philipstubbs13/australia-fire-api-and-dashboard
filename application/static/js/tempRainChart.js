//URL
const temp_url = `${api_base_url}/aus_temp_rainfall`;
console.log(temp_url);

//Retrieving data from api url
d3.json(temp_url).then((data, err) => {
    if (err) throw err;
    console.log(data);
});
