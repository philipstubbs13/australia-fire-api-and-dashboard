# Australia API and Dashboard

## Loading data into a database

The data for this project is stored in a MongoDB database.

To load the data into a local database, perform these steps:

1. Start MongoDB locally by running `mongod` from the terminal.
2. Open the [etl_fires_from_space.ipynb](./etl_fires_from_space.ipynb) jupyter notebook file and run the cells to extract, transform, and load the data.
3. Open the [WebScrapping.ipynb](./WebScrapping.ipynb) jupyter notebook file and run the cells to scrape and load the data.
4. Verify the data is inserted by opening MongoDB Compass and looking for the **australia_fire_db** database.s

## Data Structure

The **australia_fire_db** currently has the following collections:

- **fires_modis** - includes australia fires detected by MODIS satellites.
- **fires_viirs** - includes australia fires detected by VIIRS satellites.
- **historicalFires** - includes information about past Australia fire seasons.
- **fires_bystate** - includes information about the 2019-2020 bushfire season by state.

## Original Datasets

The original datasets/csv files are stored in this repository as a zip file in the [Resources](./Resources) folder.

## Starting the Flask Server

The API and the site for this project are built using the Flask framework. To start the Flask server locally:

1. Activate the python virtual environment:

```bash
conda activate PythonData
```

2. Navigate to the **application** folder.

3. Run the following command:

```bash
python app.py
```

This starts the Flask server on port 5000.

## Using the API

- Information about the different endpoints available can be found [here](https://australia-fire-api-dashboard.herokuapp.com/api/v1.0/docs).

- An example of how to get data from API using `d3.json`:

```bash
const url = "https://australia-fire-api-dashboard.herokuapp.com/api/v1.0/fires_modis"
d3.json(url).then(data => {
  console.log(data);
});
```

Another example can be found [here](./application/static/js/buildDataTable.js).

## Deployment

The site is deployed to Heroku, where the API and site are hosted. It is currently hosted at <https://australia-fire-api-dashboard.herokuapp.com/>.
