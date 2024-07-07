import os
from flask import (
    Flask, flash, render_template, 
    redirect, request, session, url_for,
    jsonify, abort
)
import datetime
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

        # Check if the password and confirm_password match
        password = request.form.get("password")
        confirm_password = request.form.get("confirm_password")
        if password != confirm_password:
            flash("Passwords must match", "danger")
            return redirect(url_for("register"))

        register = {
            "username": request.form.get("username").lower(),
            "password": generate_password_hash(request.form.get("password")),
            "skill_level": request.form.get("skill_level"),
            "member_since": datetime.datetime.now()
        }
        mongo.db.users.insert_one(register)

        # Put the new user into "session" cookie
        session["user"] = request.form.get("username").lower()
        flash("You are registered and now logged in. Welcome!", "success")
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
    This function handles requests to view a user's profile. it
    implements security checks to ensure only logged in user's
    can view their own profiles. 
    The function retrieve the username from the session and queries 
    the database to get the user's information.

    Process:
    1. The function is called when a user naviagtes to the profile
        page.
    2. The 'username parameter in the URL is passed to the function.
    3. It checks if there is a logged in user by looking for the 
        'user' in the session.
    4. If there is no logged in user it immediately redirects to the
        login page and the function ends.
    5. If there is a logged in user it queries the dataase to find the
        user.
    6). If no user is found in the database it aborts with a 404 error 
        message.
    7). if the user is found it assigns the username from the database to 
        the 'username' variable.
    8). It compares the username with the one in session. If they do
        not match it aborts with a 403 error.
    9). If all checks pass it queries the database for all records
        created by the user.m 

    Args:
    username (str): The username of the user whose profile is being accessed.
    
    Returns:
    1. If successful: Renders profile.html template with the username and 
        records.
    2. If not logged in: redirects to the login page.
    3. If user not found: Aborts with 404 error.
    4. If unauthorised access: Aborts with 403 error.
    """
   # Retrieve the session user's information from the database
    user = mongo.db.users.find_one({"username": username})
    if not user:
        abort(404)  # User not found

    # Check if user is logged in
    if "user" not in session:
        flash("You must be logged in to view that page", "warning")
        return redirect(url_for("login"))

    # Check if the requested profile matches the logged-in user
    if username != session["user"]:
        abort(403)  # Forbidden access

    # Retrieve the user's records from the database
    user_records = list(mongo.db.records.find({"created_by": username}))

    # Retrieve site types and periods for the filters
    site_types = list(mongo.db.site_types.find().sort("site_type", 1))
    periods = list(mongo.db.periods.find())

    # Retrieve member since date
    member_since = user.get("member_since", None)
    if member_since:
        member_since = member_since.strftime('%d/%m/%Y')

    # Calculate total records by a user
    total_records = len(user_records)

    skill_level = user.get("skill_level")

    return render_template(
        "profile.html",
        username=username,
        site_types=site_types,
        periods=periods,
        member_since=member_since,
        total_records=total_records,
        user_records=user_records,
        skill_level=skill_level
    )


@app.route("/fetch_user_records", methods=["GET"])
def fetch_user_records():
    """
    Retrieve the locations of records created by the logged-in user from the MongoDB collection.
    - Retrieves the username from the session to identify the logged-in user.
    - Queries the MongoDB collection to find records created by the user.
    - Extracts the location data from each record.
    - Returns the location data as JSON.

    Returns:
        JSON: A list of location coordinates for all records and user-specific records.

    Credit:
        - Adapted from https://github.com/isntlee/Sagacity/blob/master/app.py
    """
    # Retrieve the username from the session
    username = session.get("user")

    # Retrieve all records and user-specific records from the MongoDB collection
    all_records = list(mongo.db.records.find())
    user_records = list(mongo.db.records.find({'created_by': username}))

    # Convert ObjectId to string for JSON serialization
    for record in all_records:
        record["_id"] = str(record["_id"])

    for record in user_records:
        record["_id"] = str(record["_id"])

    # Return the location data as JSON
    return jsonify({"all_records": all_records, "user_records": user_records, "current_user": username})

    
@app.route("/logout")
def logout():
    """
    Handle user logout.
    Remove the user from the session cookies, flash a logout message, 
    and redirect the user to the login page.
    """
    # Remove user from the session cookies
    session.pop("user", None)
    return render_template("logout.html")


@app.route("/")
def home():
    """
    Renders home page template
    """
    periods = list(mongo.db.periods.find())
    site_types = list(mongo.db.site_types.find().sort("site_type", 1))
    return render_template("index.html", site_types=site_types, periods=periods)
    

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
            "created_by": session["user"]
        }
        mongo.db.records.insert_one(record)
        flash("New Record Created")
        return redirect(url_for("add_record"))

    site_types = list(mongo.db.site_types.find().sort("site_type", 1))
    periods = list(mongo.db.periods.find())
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

        username = session["user"]
        user_records = list(mongo.db.records.find({"created_by": username}))  # Correct query
        site_types = list(mongo.db.site_types.find().sort("site_type", 1))
        periods = list(mongo.db.periods.find())

        mongo.db.records.update_one({"_id": ObjectId(record_id)}, {"$set": updated_record})
        flash("Record successfully updated", "success")
        return render_template("record.html", username=username, records=user_records, site_types=site_types, periods=periods)

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
    flash("Record Deleted", "Success")

    # Fetch necessary data to render the record page again
    username = session["user"]
    user_records = list(mongo.db.records.find({"created_by": username}))  # Correct query
    site_types = list(mongo.db.site_types.find().sort("site_type", 1))
    periods = list(mongo.db.periods.find())

    return render_template("record.html", username=username, records=user_records, site_types=site_types, periods=periods)


@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404


@app.errorhandler(403)
def page_not_found(e):
    return render_template('403.html'), 403


if __name__ == "__main__":
    app.run(host=os.environ.get("IP"),
            port=int(os.environ.get("PORT")),
            debug=True)