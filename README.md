# Australia API and Dashboard

## Loading data into a local database

The data for this application is stored in a MongoDB database.

To load the data into a local database, perform these steps:

1. Start MongoDB locally by running `mongod` from the terminal.
2. Open the [etl_fires_from_space.ipynb](./etl_fires_from_space.ipynb) jupyter notebook file and run the cells to extract, transform, and load the data into a local database.
3. Verify the data is inserted by opening MongoDB Compass and looking for the **australia_fire_db** database, which will contain 2 collections (**fires_modis** and **fires_viirs**).

## Data Structure

The **australia_fire_db** currently has the following collections:

- The **fires_modis** collection includes australia fires detected by MODIS satellites.

  - Example document structure:

  ```bash
  _id: 5e8d367985db5a5fad7f1eef
  acq_date: "2019-08-01"
  acq_time: 56,
  bright_t31: 297.3,
  brightness: 313
  daynight: "D"
  frp: 6.6
  instrument: "MODIS"
  latitude: -11.807
  longitude: 142.0583
  satellite: "Terra"
  ```

- The **fires_viirs** collection includes australia fires detected by VIIRS satellites.

  - Example document structure:

  ```bash
  _id: 5e8d367985db5a5fad7f1eef
  acq_date: "2019-08-01"
  acq_time: 56,
  bright_ti4: 326.5
  bright_ti5: 290.7
  daynight: "D"
  frp: 6.6
  instrument: "MODIS"
  latitude: -11.807
  longitude: 142.0583
  satellite: "Terra"
  ```

  Coming soon... Documentation on what these fields mean...

## Original Datasets

The original datasets/csv files are stored in this repository as a zip file in the [Resources](./Resources) folder. Because the csv files are too large for GitHub, the zip file is tracked using [Git Large File Storage (LFS)](https://git-lfs.github.com/).

## Starting the Flask Server

The API (backend) and the dashboard site (frontend) for this project are built using the Flask framework.

To start the Flask server locally:

1. If not already, activate the python virtual environment:

```bash
conda activate PythonData
```

2. Navigate to the **application** folder.

3. Run the following command:

```bash
python app.py
```

This starts the Flask app on port 5000.

## Accessing/Using the API

- (Comming Soon) API documentation can be found [here](https://australia-fire-api-dashboard.herokuapp.com/api/v1.0/docs), which includes information about the different endpoints available.

- An example of how to get data from API in a JavaScript file using `d3.json`:

```bash
const url = "https://australia-fire-api-dashboard.herokuapp.com/api/v1.0/fires_modis"
d3.json(url).then(data => {
  console.log(data);
});
```

## Deployment

### Heroku

The application is deployed to Heroku, where the API and the dashboard site are hosted online. Deploys to Heroku are currently set up in Heroku to happen automatically any time you push changes to the GitHub repository into master. The application is currently hosted at <https://australia-fire-api-dashboard.herokuapp.com/>.
