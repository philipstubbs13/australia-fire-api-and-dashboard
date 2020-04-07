import os
from flask import (
    Flask,
    render_template,
    jsonify,
    request,
    redirect)
from flask_pymongo import PyMongo

app = Flask(__name__)

is_prod = os.environ.get('DATABASE_USERNAME', '')

if is_prod:
  app.debug = False
  username = os.environ.get('DATABASE_USERNAME', '')
  password = os.environ.get('DATABASE_PASSWORD', '')
  app.config['MONGO_URI'] = f'mongodb+srv://{username}:{password}@cluster0-laoqs.mongodb.net/test?retryWrites=true&w=majority'
  app.config['MONGO_DBNAME'] = 'australia-fire-db'
else:
  app.debug = True
  app.config['MONGO_URI'] = 'mongodb://localhost:27017/australia-fire-db'

mongo = PyMongo(app)

@app.route("/")
def home():
  return
  # return render_template("index.html")

@app.route("/charts")
def charts():
  return
  # return render_template("charts.html")

@app.route("/map")
def map():
  return
  # return render_template("map.html")

@app.route("/data")
def data():
  return
  # return render_template("data.html")

@app.route("/api/v1.0/docs")
def api_docs():
    return render_template("api_documentation.html")

# Route that will trigger the scrape function
@app.route("/scrape")
def scrape():

  # Redirect back to home page
  return redirect("/")


if __name__ == "__main__":
    app.run()
