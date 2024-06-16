import os
from flask import (
    Flask, flash, render_template, 
    redirect, request, session, url_for,
    jsonify,
)
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
    """
    Handle the user registration process.
    - If the request method is POST, check if the username already exists in the database.
    - If the username exists, flash a message and redirect to the register page.
    - If the username does not exist, hash the password and confirm_password, 
      and insert the new user data into the database.
    - Store the new user's username in the session cookie and flash a message indicating successful 
      registration.
    - Render the register template.
    """
    if request.method == "POST":
        # Check if username already exists in db
        existing_user = mongo.db.users.find_one(
            {"username": request.form.get("username").lower()}
        )

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

        # Put the new user into "session" cookie
        session["user"] = request.form.get("username").lower()
        flash("Registration Complete")
        return redirect(url_for("profile", username=session["user"]))
    return render_template("register.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    """
    Handle user login.
    If the request method is POST, verify the user's credentials.
    - Check if the username exists in the database.
    - If the username exists, verify the password.
    - If the password is correct, log the user in by adding their username to the session and flash a welcome message.
    - If the password is incorrect, flash an error message and redirect to the login page.
    - If the username does not exist, flash an error message and redirect to the login page.
    Render the login template for GET requests.
    """
    if request.method == "POST":
        # Check if username exists in db
        existing_user = mongo.db.users.find_one(
            {"username": request.form.get("username").lower()}
        )

        if existing_user:
            # Ensure hashed password matches user input
            if check_password_hash(
                existing_user["password"], request.form.get("password")
            ):
                session["user"] = request.form.get("username").lower()
                flash("Welcome back, {}".format(request.form.get("username")))
                return redirect(url_for("profile", username=session["user"]))
            else:
                # Incorrect password
                flash("Incorrect Username and/or Password")
                return redirect(url_for("login"))

        else:
            # Username doesn't exist
            flash("Incorrect Username and/or Password")
            return redirect(url_for("login"))

    return render_template("login.html")


@app.route("/profile/<username>", methods=["GET", "POST"])
def profile(username):
    """
    Display the user's profile page.
    Retrieve the username from the session and query the 
        database to get the user's information.
    - The route accepts the username as a URL parameter.
    - The username is retrieved from the session to ensure 
        it matches the logged-in user.
    - Render the profile template with the retrieved username and user records.
    
    Args:
    username (str): The username of the user whose profile is being accessed.
    
    Returns:
    - Renders the profile.html template with the username context variable.
    """
    # Retrieve the session user's name from the db
    username = mongo.db.users.find_one(
        {"username": session["user"]}
    )["username"]
    
    # Retrieve the user's records from the database
    user_records = list(mongo.db.records.find({"created_by": username}))

    if session["user"]:
        return render_template("profile.html", username=username, records=user_records)

    return redirect(url_for("login"))


@app.route("/fetch_user_records", methods=["GET"])
def fetch_user_records():
    """
    Retrieve the locations of records created by the logged-in user from the MongoDB collection.
    - Retrieves the username from the session to identify the logged-in user.
    - Queries the MongoDB collection to find records created by the user.
    - Extracts the location data from each record.
    - Returns the location data as JSON.
    
    Returns:
        JSON: A list of location coordinates for records created by the user.

    Credit:
        - Adapted from https://github.com/isntlee/Sagacity/blob/master/app.py
    """
    # Retrieve the username from the session
    username = session.get("user")

    # Retrieve the user's records from the MongoDB collection and store in a list
    user_records = list(mongo.db.records.find({'created_by': username}))

    # Convert ObjectId to string for JSON serialization
    # # Credit: https://stackoverflow.com/questions/16586180/typeerror-objectid-is-not-json-serializable
    for record in user_records:
        record["_id"] = str(record["_id"])

    # Return the location data as JSON
    return jsonify(user_records)
    

@app.route("/logout")
def logout():
    """
    Handle user logout.
    Remove the user from the session cookies, flash a logout message, 
    and redirect the user to the login page.
    """
    # Remove user from the session cookies
    flash("You have been logged out")
    session.pop("user")
    return redirect(url_for("login"))


@app.route("/")
def home():
    """
    Renders home page template
    """
    return render_template("index.html")
    

@app.route("/add_record", methods=["GET", "POST"])
def add_record():
    """
    Function to add a new site record
    """
    if request.method == "POST":
        record = {
            "title": request.form.get("title"),
            "prn": request.form.get("prn"),
            "site_type": request.form.get("site_type"),
            "monument_type": request.form.get("monument_type"),
            "interpretation": request.form.get("interpretation"),
            "period": request.form.get("period"),
            "location": request.form.get("location"),
            "created_on": request.form.get("created_on"),
            "created_by": session["user"]
        }
        mongo.db.records.insert_one(record)
        flash("New Record Created")
        return redirect(url_for("add_record"))

    site_types = mongo.db.site_types.find().sort("site_type", 1)
    periods = mongo.db.periods.find()
    return render_template(
        "record.html", site_types=site_types, periods=periods)


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


@app.route("/edit_record/<record_id>", methods=["GET", "POST"])
def edit_record(record_id):
    """
    Handle the editing of a record.
    
    This route retrieves an existing record from the database for editing and handles the form submission 
    to update the record in the database. It also populates the edit form with the current data from the 
    record and fetches the relevant options for site types, monument types, and periods from the database.

    Args:
        record_id (str): The unique identifier of the record to be edited.

    Methods:
        GET:
            - Retrieve the record based on the provided record_id.
            - Fetch the site types and periods from the database to populate the dropdown options in the form.
            - Determine the relevant monument types for the selected site type.
            - Render the edit_record.html template with the current data and dropdown options.
        
        POST:
            - Handle the form submission to update the record.
            - Retrieve form data and update the record in the database.
            - Flash a success message and redirect to the user's profile page.

    Returns:
        Template: Renders the edit_record.html template on GET request.
        Redirect: Redirects to the profile page on successful POST request.
    """
    # Get the record from the database based on record_id.
    record = mongo.db.records.find_one({"_id": ObjectId(record_id)})

    # Handle post request when the user submits the edited record form
    if request.method == "POST":
        updated_record = {
            "title": request.form.get("title"),
            "prn": request.form.get("prn"),
            "site_type": request.form.get("site_type"),
            "monument_type": request.form.get("monument_type"),
            "interpretation": request.form.get("interpretation"),
            "period": request.form.get("period"),
            "location": request.form.get("location")
        }
        mongo.db.records.update_one({"_id": ObjectId(record_id)}, {"$set": updated_record})
        flash("Record Updated")
        return redirect(url_for("profile", username=session["user"]))

    # Retrieve site types and periods from the database
    site_types = list(mongo.db.site_types.find().sort("site_type", 1))
    periods = list(mongo.db.periods.find())

    # Retrieve monument types for the selected site type
    selected_site_type = record['site_type']
    site = mongo.db.site_types.find_one({"site_type": selected_site_type})
    monument_types = [monument['monument_type'] for monument in site['monument_types']] 

    return render_template("edit_record.html", record=record, site_types=site_types, periods=periods, monument_types=monument_types)


@app.route("/delete_record/<record_id>")
def delete_record(record_id):
    """
    Function to delete a record by _id
    """
    mongo.db.records.delete_one({"_id": ObjectId(record_id)})
    flash("Recorded Deleted")
    return redirect(url_for("profile", username=session["user"]))


if __name__ == "__main__":
    app.run(host=os.environ.get("IP"),
            port=int(os.environ.get("PORT")),
            debug=True)
