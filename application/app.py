import os
from flask import (
    Flask,
    render_template,
    jsonify,
    request,
    redirect)
from flask_pymongo import PyMongo

app = Flask(__name__)

# Constants
is_prod = os.environ.get('DATABASE_USERNAME', '')
api_version = 'v1.0'
api_base_url = os.environ.get('API_BASE_URL', '') or 'http://localhost:5000/api/'
db_name = 'australia_fire_db'

# If this app is on production/deployed to heroku.
if is_prod:
  app.debug = False
  username = os.environ.get('DATABASE_USERNAME', '')
  password = os.environ.get('DATABASE_PASSWORD', '')
  mongo_uri = os.environ.get('MONGO_URI', '')
  app.config['MONGO_URI'] = mongo_uri
  app.config['MONGO_DBNAME'] = db_name
# else if you are running the app locally.
else:
  app.debug = True
  app.config['MONGO_URI'] = f'mongodb://localhost:27017/{db_name}'

mongo = PyMongo(app)

@app.route("/")
def home_page():
  data = {'api_base_url': f'{api_base_url}{api_version}' }
  return render_template("home.html", data=data)

@app.route("/data")
def data_page():
  data = {'api_base_url': f'{api_base_url}{api_version}' }
  return render_template("data.html", data=data)

# Route for api docs page.
@app.route(f"/api/{api_version}/docs")
def api_docs():
    data = {'api_base_url': f'{api_base_url}{api_version}' }
    return render_template("api_documentation.html", data=data)

# GET request - all the MODIS fires.
@app.route(f"/api/{api_version}/fires_modis", methods=['GET'])
def fires_modis():

  data = mongo.db.fires_modis.find()

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
def fires_viirs():

  data = mongo.db.fires_viirs.find()

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

# GET request - all historical/past fires.
@app.route(f"/api/{api_version}/fires_historical", methods=['GET'])
def fires_historical():

  data = mongo.db.historical_fires.find()

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

if __name__ == "__main__":
    app.run()
