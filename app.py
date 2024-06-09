import os
from flask import (
    Flask, flash, render_template, 
    redirect, request, session, url_for,
    jsonify)
from flask_pymongo import PyMongo
from bson.objectid import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
if os.path.exists("env.py"): 
    import env


app = Flask(__name__)

app.config["MONGO_DBNAME"] = os.environ.get("MONGO_DBNAME")
app.config["MONGO_URI"] = os.environ.get("MONGO_URI")
app.secret_key = os.environ.get("SECRET_KEY")

mongo = PyMongo(app)


@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        # check if username already exists in db
        existing_user = mongo.db.users.find_one(
            {"username": request.form.get("username").lower()})

        if existing_user:
            flash("Username already exists")
            return redirect(url_for("register"))

        register = {
            "username": request.form.get("username").lower(),
            "password": generate_password_hash(request.form.get("password")),
            "confirm_password": generate_password_hash(request.form.get("confirm_password")),
            "skill_level": request.form.get("skill_level")
        }
        mongo.db.users.insert_one(register)

        # put the new user into "session" cookie
        session["user"] = request.form.get("username").lower()
        flash("Registration Complete")
    return render_template("register.html")


@app.route("/")
def home():
    '''
    Renders home page template
    '''
    return render_template("index.html")
    

@app.route("/add_record", methods=["GET", "POST"])
def add_record():
    '''
    Renders page to create new site record
    '''
    
    site_types = mongo.db.site_types.find().sort("site_type, 1")
    periods = mongo.db.periods.find()
    return render_template("record.html", site_types=site_types, periods=periods)


@app.route('/get_monument_types', methods=['POST'])
def get_monument_types():
    """
    This route handles getting monument types based on the site type selected by the user.
    
    It listens for POST requests at '/get_monument_types' and expects a JSON input with 
    a 'site_type' key. The function looks up the monument types for that site type in the 
    MongoDB database and sends them back as a JSON response.
    """
    selected_site_type = request.json.get('site_type')
    site = mongo.db.site_types.find_one({"site_type": selected_site_type})
    monument_types = [monument['monument_type'] for monument in site['monument_types']] if site else []
    return jsonify(monument_types)


if __name__ == "__main__":
    app.run(host=os.environ.get("IP"),
            port=int(os.environ.get("PORT")),
            debug=True)