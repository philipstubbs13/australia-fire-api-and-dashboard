# Australian Bushfire API and Dashboard

## Background

This project explores how wildfires have affected Australia over time through data visualizations, including interactive time series charts, plots and a map. Visit the [website](https://australia-fire-api-dashboard.herokuapp.com/) to learn more.

This project incorporates open data from a number of sources, including data captured by NASA satellites and various wildfire and climate data. More information about the sources and the data itself can be found in the [Data page](./docs/data.md) in the `docs` folder.

This README includes background information about the project and steps on how to set up the application locally.

### Technologies Used

#### Backend

- [Flask](https://flask.palletsprojects.com/en/1.1.x/), a Python micro web framework used to run the application.
- [MongoDB](https://www.mongodb.com/), a NoSQL for storing the data locally.
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), for storing the data in the cloud.
- [Heroku](https://www.heroku.com/), for running the dashboard in the cloud.
- [Jupyter Notebook](https://jupyter.readthedocs.io/en/latest/running.html), for running Python code within a larger document.
- [Python](https://www.python.org/), including packages like [pandas](https://pandas.pydata.org/) and [Beautiful Soup](https://pypi.org/project/beautifulsoup4/).

#### Frontend

- [D3.js](https://d3js.org/), a JavaScript data visualization library.
- [d3-timeseries](https://github.com/mcaule/d3-timeseries), a library for building time series charts.
- [Leaflet](https://leafletjs.com/), a JavaScript library for building interactive maps.


## Installation

### Step 1. Clone the repo

Download or clone this repository.

### Step 2. Load the data

The data for this project is stored in a MongoDB database.

Background information on the [Data](https://australia-fire-api-dashboard.herokuapp.com/data) sources can be found on [the website](https://australia-fire-api-dashboard.herokuapp.com/data), and a detailed list of fields and data types for each collection can be found in the [Data page](./docs/data.md) in `docs`.

To load the data into a local database, perform these steps:

1. Start MongoDB locally by running `mongod` from Git Bash/Terminal.
2. Launch a Jupyter Notebook from Git Bash/Terminal (by running `jupyter notebook`). Note that you will likely need to install some packages like `pandas`, `Beautiful Soup`, `pymongo`, and `numpy` to get the notebooks up and running. Open and run:
    * [etl_fires_from_space.ipynb](./etl_fires_from_space.ipynb)
    * [WebScraping.ipynb](./WebScraping.ipynb) 
    * [temp_rainfall.ipynb](./temp_rainfall.ipynb) 

3. Verify that the data is inserted into the database properly by opening MongoDB from Git Bash/Terminal or using a program like MongoDB Compass and looking for the **australia_fire_db** database. 

### Step 3. Start a Flask Server

The API and the application for this project are built using the Flask framework. To start a Flask server locally:

1. Activate a Python virtual environment that has the appropriate packages installed, as shown in the following example:

```bash
conda activate PythonData
```

2. Navigate to the **application** folder.

3. Run the following command:

```bash
python app.py
```

This starts the Flask server on port 5000. You can then copy and paste the Flask URL into your browser to see the locally-hosted application in action.

## Using the API to build visualizations

- The visualizations for this project are powered using the API endpoints.  Information about the different endpoints can be found [on the website](https://australia-fire-api-dashboard.herokuapp.com/api/v1.0/docs) and [in the `docs`](./docs/data.md).

- Here's an example of how to retrieve data from the `fires_modis` API endpoint using `d3`:

```bash
const url = "https://australia-fire-api-dashboard.herokuapp.com/api/v1.0/fires_modis"
d3.json(url).then(data => {
  console.log(data);
});
```

- You can build on this work by creating your own visualizations using the API. Examples for how to integrate the data retrieved from the API into visualizations including charts and maps can be found in [`static/js`](./static/js).

### Rendering the bushfire map 

To view the live bushfire map locally:

1. Create and save a `config.py` file in the root directory within the **application** folder of this repository.
2. Add the following line to the `config.py` file:

```py
API_KEY = "your_key_here"
```

Replace `your_key_here` with your Mapbox API key. More information on Mapbox API keys can be found on [the Mapbox website](https://docs.mapbox.com/help/how-mapbox-works/access-tokens/).

## Deploying the application to Heroku

The application is deployed to Heroku. It is currently hosted at <https://australia-fire-api-dashboard.herokuapp.com/>.

To get started, check out the [official instructions](https://devcenter.heroku.com/articles/git) for setting up an app on Heroku.

Note: If you add a Python package to the app, make sure you add that package to the **requirements.txt** file in the root directory of your version of the project.

To deploy a branch from Heroku:

1. Push your changes to the branch you want to deploy.
2. Log into Heroku and go to the [Deploy](https://dashboard.heroku.com/apps/australia-fire-api-dashboard/deploy/github) tab for the **australia-fire-api-dashboard** app.
3. Scroll all the way to the bottom to the **Manual Deploy** section.
4. Choose a branch to deploy from the dropdown (it will most likely be the master branch).
5. Click **Deploy Branch**.

## License

You are welcome to fork this repo and build upon this work under the terms of an MIT license.