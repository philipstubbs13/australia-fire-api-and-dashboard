import os
from flask import (
    Flask,
    render_template,
    jsonify,
    request,
    redirect)
from flask_pymongo import PyMongo
from flask_cors import CORS, cross_origin
import datetime

try:
    from config import API_KEY
except ImportError:
    config = None

app = Flask(__name__)
CORS(app)
app.config['JSON_SORT_KEYS'] = False

# Constants
is_prod = os.environ.get('DATABASE_USERNAME', '')
api_version = 'v1.0'
api_base_url = os.environ.get('API_BASE_URL', '') or 'http://localhost:5000/api/'

# Cors
app.config['CORS_HEADERS'] = 'Content-Type'

# No more page caching/need to hard refresh.
# Still need to soft refresh the page though when making changes to static files...
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

# If this app is on production/deployed to heroku.
if is_prod:
  app.debug = False
  username = os.environ.get('DATABASE_USERNAME', '')
  password = os.environ.get('DATABASE_PASSWORD', '')
  mongo_uri = os.environ.get('MONGO_URI', '')
  db_name = os.environ.get('DB_NAME', '')
  app.config['MONGO_URI'] = mongo_uri
  app.config['MONGO_DBNAME'] = db_name
  map_api_key = os.environ.get('MAP_API_KEY', '')
# else if you are running the app locally.
else:
  app.debug = True
  db_name = 'australia_fire_db'
  app.config['MONGO_URI'] = f'mongodb://localhost:27017/{db_name}'
  map_api_key = API_KEY

mongo = PyMongo(app)

# Validate the start date and end date the user chooses to filter by
# and verify that they are in the format, 'YYYY-MM-DD'.
def validate(date_string):
  try:
    datetime.datetime.strptime(date_string, '%Y-%m-%d')
    is_valid_date = True
  except ValueError:
    is_valid_date = False
  return is_valid_date

# Create query filter based on start and end date
def create_date_filter(start_date, end_date):
  query_filter = {}
  # If querying fires on or after a particular date and that date is in the correct format.
  if start_date != None and validate(start_date):
    # If also querying fires on or before a particular date, that date is in the correct format,
    # and the start date is before the end date.
    if end_date != None and validate(end_date) and start_date <= end_date:
      query_filter['acq_date'] = { '$gte' : start_date, '$lte': end_date }
    else:
      query_filter['acq_date'] = { '$gte': start_date }
  return query_filter

@app.route("/")
def home_page():
  data = {'api_base_url': f'{api_base_url}{api_version}', 'API_KEY': map_api_key }
  return render_template("home.html", data=data)

@app.route("/charts")
def charts_page():
  data = {'api_base_url': f'{api_base_url}{api_version}', 'API_KEY': map_api_key }
  return render_template("charts.html", data=data)

@app.route("/data")
def data_page():
  data = {'api_base_url': f'{api_base_url}{api_version}', 'API_KEY': map_api_key }
  return render_template("data.html", data=data)

@app.route("/map")
def map_page():
  data = {'api_base_url': f'{api_base_url}{api_version}', 'API_KEY': map_api_key}
  return render_template("map.html", data=data)

# Route for api docs page.
@app.route(f"/api/{api_version}/docs")
def api_docs():
    data = {'api_base_url': f'{api_base_url}{api_version}', 'API_KEY': map_api_key }
    return render_template("api_documentation.html", data=data)

# GET request - all the MODIS fires.
@app.route(f"/api/{api_version}/fires_modis", methods=['GET'])
@cross_origin()
def fires_modis():

  # Get the values of the request arguments.
  limit = request.args.get('limit')
  start_date = request.args.get('start_date')
  end_date = request.args.get('end_date')
  query_filter = create_date_filter(start_date, end_date)

  if limit != None:
    limit = int(limit)
    data = mongo.db.fires_modis.find(query_filter).limit(limit)
  else:
    data = mongo.db.fires_modis.find(query_filter)

  output = []

  for fire in data:
    output.append({
      'id': str(fire['_id']),
      'acq_date': fire['acq_date'],
      'acq_time': fire['acq_time'],
      'brightness' : fire['brightness'],
      'daynight' : fire['daynight'],
      'frp': fire['frp'],
      'instrument': fire['instrument'],
      'latitude': fire['latitude'],
      'longitude': fire['longitude'],
      'satellite': fire['satellite'],
      'bright_t31': fire['bright_t31']
    })

  return jsonify({'result' : output})

# GET request - all the VIIRS fires.
@app.route(f"/api/{api_version}/fires_viirs", methods=['GET'])
@cross_origin()
def fires_viirs():

  # Get the values of the request arguments.
  limit = request.args.get('limit')
  start_date = request.args.get('start_date')
  end_date = request.args.get('end_date')
  query_filter = create_date_filter(start_date, end_date)

  if limit != None:
    limit = int(limit)
    data = mongo.db.fires_viirs.find(query_filter).limit(limit)
  else:
    data = mongo.db.fires_viirs.find(query_filter)

  output = []

  for fire in data:
    output.append({
      'id': str(fire['_id']),
      'acq_date': fire['acq_date'],
      'acq_time': fire['acq_time'],
      'bright_ti4' : fire['bright_ti4'],
      'bright_ti5' : fire['bright_ti5'],
      'frp': fire['frp'],
      'instrument': fire['instrument'],
      'latitude': fire['latitude'],
      'longitude': fire['longitude'],
      'satellite': fire['satellite'],
    })

  return jsonify({'result' : output})

# GET request - all MODIS fires in GeoJSON format
@app.route(f"/api/{api_version}/fires_modis_geojson", methods=['GET'])
@cross_origin()
def fires_modis_geojson():

  # Get the values of the request arguments.
  limit = request.args.get('limit')
  start_date = request.args.get('start_date')
  end_date = request.args.get('end_date')
  query_filter = create_date_filter(start_date, end_date)

  if limit != None:
    limit = int(limit)
    data = mongo.db.fires_modis.find(query_filter).limit(limit)
  else:
    data = mongo.db.fires_modis.find(query_filter)

  output = []

  for fire in data:
    output.append({
      'type': 'Feature',
      'geometry' : {
          'type': 'Point',
          'coordinates': [fire['longitude'], fire['latitude']],
          },
      'properties' : {
        'id': str(fire['_id']),
        'acq_date': fire['acq_date'],
        'acq_time': fire['acq_time'],
        'brightness' : fire['brightness'],
        'daynight' : fire['daynight'],
        'frp': fire['frp'],
        'instrument': fire['instrument'],
        'satellite': fire['satellite'],
        'bright_t31': fire['bright_t31']
      }
    })

  return jsonify({
    "type": "FeatureCollection",
    "features": output})

# GET request - all VIIRS fires in GeoJSON format
@app.route(f"/api/{api_version}/fires_viirs_geojson", methods=['GET'])
@cross_origin()
def fires_viirs_geojson():

   # Get the values of the request arguments.
  limit = request.args.get('limit')
  start_date = request.args.get('start_date')
  end_date = request.args.get('end_date')
  query_filter = create_date_filter(start_date, end_date)

  if limit != None:
    limit = int(limit)
    data = mongo.db.fires_viirs.find(query_filter).limit(limit)
  else:
    data = mongo.db.fires_viirs.find(query_filter)

  output = []

  for fire in data:
    output.append({
      'type': 'Feature',
      'geometry' : {
          'type': 'Point',
          'coordinates': [fire['longitude'], fire['latitude']],
          },
      'properties' : {
        'id': str(fire['_id']),
        'acq_date': fire['acq_date'],
        'acq_time': fire['acq_time'],
        'bright_ti4' : fire['bright_ti4'],
        'bright_ti5' : fire['bright_ti5'],
        'frp': fire['frp'],
        'instrument': fire['instrument'],
        'satellite': fire['satellite']
      }
    })

  return jsonify({
    "type": "FeatureCollection",
    "features": output})

# GET request - all historical/past fires.
@app.route(f"/api/{api_version}/fires_historical", methods=['GET'])
@cross_origin()
def fires_historical():

  data = mongo.db.historicalFires.find()

  output = []

  for fire in data:
    output.append({
      'id': str(fire['_id']),
      'date': fire['Date'],
      'name': fire['Name'],
      'state' : fire['State(s)/territories'],
      'area_burned_ha' : fire['AreaBurned(ha)'],
      'area_burned_acres': fire['AreaBurned(acres)'],
      'fatalities': fire['Fatalities'],
      'homes_destroyed': fire['PropertiesDamaged(HomesDestroyed)'],
      'year': fire['Year'],
    })

  return jsonify({'result' : output})

# GET request - all of the 2019-2020 bushfire info by state
@app.route(f"/api/{api_version}/fires_bystate", methods=['GET'])
@cross_origin()
def fires_bystate():

  data = mongo.db.bushfiresbyState.find()

  output = []

  for fire in data:
    output.append({
      'id': str(fire['_id']),
      'state': fire['State/Territory'],
      'fatalities': fire['Fatalities'],
      'homeslost' : fire['Homeslost'],
      'area_burned_ha' : fire['Area(estimated)(ha)'],
      'area_burned_acres': fire['Area(estimated)(acres)']
    })

  return jsonify({'result' : output})

# GET request - additional 2019-2020 bushfire season information
@app.route(f"/api/{api_version}/bushfire_season_2019", methods=['GET'])
@cross_origin()
def bushfire_season_2019():

  data = mongo.db.aus2019_2020.find()

  output = []

  for fire in data:
    output.append({
      'id': str(fire['_id']),
      'fire': fire['Fire'],
      'state': fire['State'],
      'local_government_area' : fire['Local Government Area(s)'],
      'area_burned_ha' : fire['AreaImpacted(ha)']
    })

  return jsonify({'result' : output})

# GET request - temp and rainfall data
@app.route(f"/api/{api_version}/aus_temp_rainfall", methods=['GET'])
@cross_origin()
def aus_temp_rainfall():

  data = mongo.db.temp_rainfall.find()

  output = []

  for fire in data:
    output.append({
      'id': str(fire['_id']),
      'year': fire['Year'],
      'avg_annual_temp': fire['Avg Annual Temp'],
      'avg_annual_rainfall' : fire['Avg Annual Rainfall'],
      'temp_difference': fire['temp_differnce'],
      'rainfall_difference': fire['rainfall_difference']
    })

  return jsonify({'result' : output})


# GET request - get timeseries data to show number of fires captured by nasa satellites
# over time during the 2019-20 fire season.
@app.route(f"/api/{api_version}/fires_time_series", methods=['GET'])
@cross_origin()
def fires_time_series():

  # Get the values of the request arguments.
  # (i.e, these values are what the user selects in the UI).
  # satellite = request.args.get('satellite')
  # time = request.args.get('time')
  start_date = request.args.get('start_date')
  end_date = request.args.get('end_date')
  query_filter = {}

  # If querying fires by type of satellite.
  # if satellite != None and satellite != 'All':
  #   query_filter["satellite"] = satellite

  # # If querying fires by the time of day.
  # if time != None and time != 'All':
  #   query_filter["daynight"] = time

  # If querying fires on or after a particular date and that date is in the correct format.
  if start_date != None and validate(start_date):
    # If also querying fires on or before a particular date, that date is in the correct format,
    # and the start date is before the end date.
    if validate(end_date) and start_date < end_date:
      query_filter['acq_date'] = { '$gte' : start_date, '$lte': end_date }
    else:
      query_filter['acq_date'] = { '$gte': start_date }

  data = mongo.db.fires_time_series.find(query_filter)

  output = []

  for fire in data:
    output.append({
      'id': str(fire['_id']),
      'x': fire['acq_date'],
      'y': fire['number_fires'],
    })

  # Create a list of just the dates.
  # dates = []
  # for fire in output:
  #   key = 'acq_date'
  #   if key in fire.keys():
  #     dates.append(fire[key])

  # # Count how many times each date appears in the list to determine how many fires there were.
  # freq = {}
  # freq_list = []
  # for date in dates:
  #   if (date in freq):
  #     freq[date] += 1
  #   else:
  #     freq[date] = 1

  # # Return the data in a format the the d3-timeseries library can used to plot it.
  # for key, value in freq.items():
  #   freq_list.append({ 'x': key, 'y': value })

  return jsonify({'result' : output })

if __name__ == "__main__":
    app.run()
