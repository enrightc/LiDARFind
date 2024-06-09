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
    '''
    Handle the user registration process.
    - If the request method is POST, check if the username already exists in the database.
    - If the username exists, flash a message and redirect to the register page.
    - If the username does not exist, hash the password and confirm_password, 
        and insert the new user data into the database.
    - Store the new user's username in the session cookie and flash a message indicating successful 
        registration.
    - Render the register template.
    '''
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
        return redirect(url_for("profile", username=session["user"]))
    return render_template("register.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    '''
    Handle user login.
    If the request method is POST, verify the user's credentials.
    - Check if the username exists in the database.
    - If the username exists, verify the password.
    - If the password is correct, log the user in by adding their username to the session and flash a welcome message.
    - If the password is incorrect, flash an error message and redirect to the login page.
    - If the username does not exist, flash an error message and redirect to the login page.
    Render the login template for GET requests.
    '''
    if request.method == "POST":
        # check if username exists in db
        existing_user = mongo.db.users.find_one(
            {"username": request.form.get("username").lower()})

        if existing_user:
            # ensure hashed password matches user input
            if check_password_hash(
                existing_user["password"], request.form.get("password")):
                    session["user"] = request.form.get(
                        "username").lower()
                    flash("Welcome back, {}".format(
                        request.form.get("username")))
                    return redirect(url_for(
                        "profile", username=session["user"]))
            else:
                # Incorrect password
                flash("Incorrect Username and/or Password")
                return redirect(url_for("login"))

        else:
            # username doesn't exist
            flash("Incorrect Username and/or Password")
            return redirect(url_for("login"))

    return render_template("login.html")


@app.route("/profile <username>", methods=["GET", "POST"])
def profile(username):
    '''
    Display the user's profile page.
    Retrieve the username from the session and query the 
        database to get the user's information.
    - The route accepts the username as a URL parameter.
    - The username is retrieved from the session to ensure 
        it matches the logged-in user.
    - Render the profile template with the retrieved username.
    Args:
    username (str): The username of the user whose profile is being accessed.
    Returns:
    - Renders the profile.html template with the username context variable.
    '''
    # Retrieve the session user's name from the db
    username = mongo.db.users.find_one(
        {"username": session["user"]})["username"]
    return render_template("profile.html", username=username)


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
    This route handles getting monument types based on the site
     type selected by the user.
    
    It listens for POST requests at '/get_monument_types' and 
    expects a JSON input with 
    a 'site_type' key. The function looks up the monument types 
    for that site type in the 
    MongoDB database and sends them back as a JSON response.
    """
    selected_site_type = request.json.get('site_type')
    site = mongo.db.site_types.find_one({"site_type": selected_site_type})
    monument_types = [monument['monument_type'] for monument in site[
        'monument_types']] if site else []
    return jsonify(monument_types)


if __name__ == "__main__":
    app.run(host=os.environ.get("IP"),
            port=int(os.environ.get("PORT")),
            debug=True)