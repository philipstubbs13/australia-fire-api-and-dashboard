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
api_base_url = '/api/v1.0/'
db_name = 'test'

# If this app is on production/deployed to heroku.
if is_prod:
  app.debug = False
  username = os.environ.get('DATABASE_USERNAME', '')
  password = os.environ.get('DATABASE_PASSWORD', '')
  app.config['MONGO_URI'] = f'mongodb+srv://phil:{password}@cluster0-laoqs.mongodb.net/test?retryWrites=true&w=majority'
  app.config['MONGO_DBNAME'] = db_name
# else if you are running the app locally.
else:
  app.debug = True
  app.config['MONGO_URI'] = f'mongodb+srv://phil:phil@cluster0-laoqs.mongodb.net/test?retryWrites=true&w=majority'

mongo = PyMongo(app)

# Route for api docs page.
@app.route("/")
@app.route(f"{api_base_url}docs")
def api_docs():
    return render_template("api_documentation.html")

# GET request - all the MODIS fires.
@app.route(f"{api_base_url}fires_modis", methods=['GET'])
def fires_modis():

  data = mongo.db.fires_from_space.find()

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
    })

  return jsonify({'result' : output})

# GET request - all the VIIRS fires.
@app.route(f"{api_base_url}fires_viirs", methods=['GET'])
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

if __name__ == "__main__":
    app.run()
