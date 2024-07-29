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
app.config["BING_API_KEY"] = os.environ.get("BING_API_KEY")


mongo = PyMongo(app)


@app.after_request
def add_header(response):
    """
    Prevent users from using the back button to return to the login page
    or a cached profile after logging out.
    source: https://stackoverflow.com/questions/20652784/flask-back
        -button-returns-to-session-even-after-logout/48358008
    """
    response.cache_control.no_store = True
    return response


@app.route("/register", methods=["GET", "POST"])
def register():
    """
    Handle the user registration process.
    1. If the request method is POST:
        - check if the username already exists in the database.
        - If the username exists, flash a message and redirect
            to the register page.
        - If the username does not exist, hash the password
            and create a dictionary with the user's information.
        - Insert the new user data into the database.
        - Store the new user's username and admin status in the session cookie.
        - Flash a success message and redirect to the user's profile page.
    2. If the request method is GET:
        - Render the register template.
    """
    if request.method == "POST":
        # Check if username already exists in db
        existing_user = mongo.db.users.find_one(
            {"username": request.form.get("username").lower()}
        )

        # If the username exists, flash a message and redirect
        #   to the register page
        if existing_user:
            flash("Username already exists")
            return redirect(url_for("register"))

        # Check if the password and confirm_password match
        password = request.form.get("password")
        confirm_password = request.form.get("confirm_password")
        if password != confirm_password:
            flash("Passwords must match", "danger")
            return redirect(url_for("register"))

        # Create a dictionary for the new user
        # isAdmin manually change to true for admin credentials.
        register = {
            "username": request.form.get("username").lower(),
            "password": generate_password_hash(request.form.get("password")),
            "skill_level": request.form.get("skill_level"),
            "member_since": datetime.datetime.now(),
            "is_admin": False
        }

        # Insert the new user into the database
        mongo.db.users.insert_one(register)

        # Put the new user into "session" cookie
        session["user"] = request.form.get("username").lower()
        session["is_admin"] = False

        # Flash a message indicating successful registration
        flash("You are registered and now logged in. Welcome!", "success")

        # Redirect to the user's profile page after successful registration
        return redirect(url_for("profile", username=session["user"]))

    # Render the register template if the request method is GET
    return render_template("register.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    """
    Handle user login.
    1. Check if the user is already logged in:
        - If the user. is already in session, skip the login process.

    2. If the request method is POST:
        - Check if the username already exists in the database.
        - If the username exists, verify the password.
            - If the password is correct, log the user in by storing their
                username and admin status in the session.
            - Flash a welcome message and redirect to the user's profile page.
            - If the password is incorrect, flash an error message and
                redirect to the login page.
            - If the username does not exist, flash an error message and
                redirect to the login page.
    3. If the request method is GET Render the login template.
    """
    if "user" in session:
        return redirect(url_for("profile", username=session["user"]))
        
    # Check that the user is not already logged in
    if "user" not in session:

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
                    session["is_admin"] = existing_user.get("is_admin", False)
                    flash("Welcome back, {}".format(
                        request.form.get("username")))
                    return redirect(url_for(
                        "profile", username=session["user"]))
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
    1.  Retrieve the user information from the database
        using the provided username.
       - If the user is not found, abort with a 404 error.
    2. Check if a user is logged in by verifying the
        session.
       - If no user is logged in, flash a warning message
        and redirect to the login page.
    3. Ensure the logged-in user is viewing their own profile.
       - If the username in the session does not match the
        requested profile, abort with a 403 error.
    4. Retrieve the user's records from the database.
    5. Format the member since date for display.
    6. Calculate the total number of records created by the user.
    7. Render the profile.html template with user-specific data.

    Args:
    username (str): The username of the user whose profile is being accessed.

    Returns:
    1. If successful: Renders profile.html template with the username and
        records.
    2. If not logged in: redirects to the login page.
    3. If user not found: Aborts with 404 error.
    4. If unauthorised access (User tries to access another
        users profile): Aborts with 403 error.
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

    # Retrieve member since date and format
    member_since = user.get("member_since", None)
    if member_since:
        member_since = member_since.strftime('%d/%m/%Y')

    # Calculate total records by a user
    total_records = len(user_records)

    # Retrieve skill level
    skill_level = user.get("skill_level")

    return render_template(
        "profile.html",
        username=username,
        member_since=member_since,
        total_records=total_records,
        user_records=user_records,
        skill_level=skill_level,
        is_admin=session.get('is_admin', False)
    )


@app.route("/fetch_user_records", methods=["GET"])
def fetch_user_records():
    """
    This function dynamically fetches and displays records on the map.
    It retrieves the locations of records created by the logged-in
    user from the MongoDB collection.

    Process:
    - Retrieves the username from the session to identify the logged-in user.
    - Queries the MongoDB collection to find records created by the user.
    - Extracts and converts the location data from each record.
    - Returns the location data as JSON, including both all records
        and user-specific records.

    Returns:
        JSON: A list of location coordinates for all records
            and user-specific records,
              along with the current user's username.

    Map Display:
    - The returned JSON data is fetched by JavaScript to dynamically
        display markers on the map.
    - Each marker is associated with the relevant record data and
        displayed interactively with site details.

    Credit:
        - Adapted from https://github.com/isntlee/Sagacity/blob/master/app.py
    """
    # Retrieve the username from the session
    username = session.get("user")

    # Retrieve all records
    # and user-specific records from the MongoDB collection
    all_records = list(mongo.db.records.find())
    user_records = list(mongo.db.records.find({'created_by': username}))

    # Convert ObjectId to string for JSON serialisation
    for record in all_records:
        record["_id"] = str(record["_id"])

    for record in user_records:
        record["_id"] = str(record["_id"])

    # Return the location data as JSON
    return jsonify({"all_records": all_records,
                    "user_records": user_records,
                    "current_user": username})


@app.route("/logout")
def logout():
    """
    Handle user logout.
    Remove the user from the session cookies, flash a logout message,
    and redirect the user to the login page.
    """
    # check that the user is logged in
    if "user" in session:

        # Remove user from the session cookies
        session.pop("user", None)
        # Ensure admin privileges are cleared from session.
        session.pop("is_admin", None)

    return render_template("logout.html")


@app.route("/")
def home():
    """
    Renders home page template.
    This function handles requests to the root URL ("/"). It retrieves
    data needed for the home page and renders the template.

    Process:
    - Queries the MongoDB collection to retrieve all periods.
    - Queries the MongoDB collection to retrieve all site types.
    - Passes the retrieved periods and site types to the
        template for rendering.

    Returns:
        Rendered HTML template for the home page with site
            types and periods.
    """
    # Retrieve all periods from the database for displaying in filter
    periods = list(mongo.db.periods.find())

    # Retrieve all site types from the database for the filter
    site_types = list(mongo.db.site_types.find())

    # Render the home page template with the retrieved periods and site types
    return render_template("index.html",
                           site_types=site_types,
                           periods=periods)


@app.route("/admin_dashboard")
def admin_dashboard():
    """
    Renders admin dashboard template
    Only accessible to admin users

    This function handles requests to the admin dashboard
    URL ("/admin_dashboard").
    It checks if the user in the session is an admin
    and retrieves necessary data
    to be displayed on the admin dashboard.

    Process:
    - Check if a user is logged in and is an admin.
        If not, abort with a 403 error.
    - If the user is an admin, retrieve all records and
        users from the MongoDB collections.
    - Format the 'member_since' date for each user.
    - Render the admin dashboard template with the retrieved
        data.

    Returns:
        Rendered HTML template for the admin dashboard with
        users and records.
    """
    # check if the user in session is admin
    if not session.get("is_admin"):
        abort(403)   # Forbidden access

    # If admin, retrieve all records and users from the database
    records = list(mongo.db.records.find())
    users = list(mongo.db.users.find())

    # Format the 'member_since' date for each user
    for user in users:
        if "member_since" in user:
            user["member_since"] = user["member_since"].strftime('%d/%m/%Y')

    # Render the admin dashboard template with the retrieved data
    return render_template("admin-dashboard.html",
                           all_records=records,
                           all_users=users)


@app.route("/resources")
def resources():
    """
    Renders resources page template
    """
    return render_template("resources.html")


@app.route("/add_record", methods=["GET", "POST"])
def add_record():
    """
    Function to add a new site record.
    This function handles both displaying the form for adding
        a new site record (GET request)
    and processing the form submission to create a new record
        in the database (POST request).

    Process:
    - For GET requests:
        - Retrieve site types and periods from the MongoDB
            collections to populate the dropdown options in the form.
        - Render the "record.html" template with the site types,
            periods for dropdown options.
    - For POST requests:
        - Retrieve form data to create a new record dictionary.
        - Insert the new record into the MongoDB collection.
        - Flash a success message indicating that the record has
        been created.
        - Redirect to the "add_record" page to allow the user
        to add another record.

    Returns:
        - For GET requests: Rendered "record.html" template with
            site types, periods, and admin status.
        - For POST requests: Redirect to the "add_record"
            page with a success message.
    """
    if request.method == "POST":
        # Create a new record dictionary from the form data
        record = {
            "title": request.form.get("title"),
            "prn": request.form.get("prn"),
            "site_type": request.form.get("site_type"),
            "monument_type": request.form.get("monument_type"),
            "description": request.form.get("description"),
            "period": request.form.get("period"),
            "location": request.form.get("location"),
            "created_by": session["user"],
            "created_on": datetime.datetime.utcnow().strftime('%d/%m/%Y')
        }

        # Insert the new record into the MongoDB collection
        mongo.db.records.insert_one(record)
        flash("New Record Created", "success")
        return redirect(url_for("add_record"))

    # Retrieve site types and periods from the MongoDB
    # collections for the form
    site_types = list(mongo.db.site_types.find())
    periods = list(mongo.db.periods.find())

    return render_template(
                            "record.html",
                            site_types=site_types,
                            periods=periods,
                            is_admin=session.get('is_admin', False)
                         )


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

    This function works in conjunction with the JavaScript code,
    which dynamically updates the monument type dropdown
        based on the selected site type.

    Process:
    - Retrieve the 'site_type' value from the incoming
        JSON request.
    - Query the MongoDB collection 'site_types' to find
        the document that matches
      the provided 'site_type'.
    - Extract the 'monument_types' field from the found document.
    - If the document exists, extract and list the monument
        types; otherwise,
      return an empty list.
    - Return the list of monument types as a JSON response.
    """
    # Retrieve the selected site type from the JSON request
    selected_site_type = request.json.get('site_type')

    # Find the document in the 'site_types' collection that
    # matches the selected site type
    site = mongo.db.site_types.find_one(
        {"site_type": selected_site_type})

    # Extract the monument types from the document,
    # or return an empty list if not found
    monument_types = [monument['monument_type'] for monument in site[
        'monument_types']] if site else []

    # Return the monument types as a JSON response
    return jsonify(monument_types)


@app.route("/edit-record/<record_id>", methods=["GET", "POST"])
def edit_record(record_id):
    """
    Handle the editing of a record.

    This route retrieves an existing record from the database for editing
    and handles the form submission
    to update the record in the database. It also populates the edit form
    with the current data from the
    record and fetches the relevant options for site types, monument types,
    and periods from the database.

    Args:
        record_id (str): The unique identifier of the record to be edited.

    Process:
        GET:
            - Check if the user is logged in. If not, redirect
                to the login page.
            - Retrieve the record based on the provided record_id.
            - If the record is not found, abort with a 404 error.
            - Check if the logged-in user is the creator of the
                record or an admin.
                If not, abort with a 403 error.
            - Fetch the site types and periods from the database
                to populate the
                dropdown options in the form.
            - Determine the relevant monument types for the selected
                site type.
            - Render the edit_record.html template with the current
                data and dropdown options.
        POST:
            - Check if the user is logged in. If not, redirect to the
                login page.
            - Retrieve form data and create an updated record dictionary.
            - Update the record in the MongoDB collection with the new data.
            - Flash a success message indicating that the record has been
                successfully updated.
            - Redirect to the appropriate page based on the referrer
                (profile page, admin dashboard, or add_record page).

    Returns:
        Template: Renders the edit_record.html template on GET request.
        Redirect: Redirects to the profile page, admin dashboard,
            or add_record page on successful POST request.
    """

    # Check if the user is logged in
    if "user" not in session:
        flash("You must be logged in to edit a record", "warning")
        return redirect(url_for("login"))

    # Get the record from the database based on record_id.
    record = mongo.db.records.find_one({"_id": ObjectId(record_id)})

    # If the record is not found, abort with a 404 error
    if not record:
        abort(404)  # Record not found

    # Check if the logged-in user is the creator of the record or an admin
    if record["created_by"] != session["user"] and not session.get(
            "is_admin", False):
        abort(403)  # User is not authorised to edit this record

    # Handle post request when the user submits the edited record form
    if request.method == "POST":
        # Create an updated record dictionary from the form data
        updated_record = {
            "title": request.form.get("title"),
            "prn": request.form.get("prn"),
            "site_type": request.form.get("site_type"),
            "monument_type": request.form.get("monument_type"),
            "description": request.form.get("description"),
            "period": request.form.get("period"),
            "location": request.form.get("location")
        }

        # Update the record in the MongoDB collection with the new data
        mongo.db.records.update_one({"_id": ObjectId(record_id)},
                                    {"$set": updated_record})
        flash("Record successfully updated", "success")

        # Determine where to redirect based on the referrer
        # retrieve ref from form
        ref = request.form.get('ref')
        if ref == 'profile':
            return redirect(url_for("profile", username=session["user"]))
        elif ref == 'admin_dashboard':
            return redirect(url_for('admin_dashboard'))
        else:
            return redirect(url_for('add_record'))

    # Retrieve site types and periods from the database for the form
    site_types = list(mongo.db.site_types.find().sort("site_type", 1))
    periods = list(mongo.db.periods.find())

    # Retrieve monument types for the selected site type
    selected_site_type = record['site_type']
    site = mongo.db.site_types.find_one({"site_type": selected_site_type})
    monument_types = [monument['monument_type']
                      for monument in site['monument_types']]

    return render_template("edit-record.html",
                           record=record,
                           site_types=site_types,
                           periods=periods,
                           monument_types=monument_types)


@app.route("/delete_record/<record_id>")
def delete_record(record_id):
    """
    Handle the deletion of a site record by its unique identifier (_id).

    Process:
    - Verify if the user is logged in.
    - Fetch the record from the database using the provided record_id.
    - Check if the record exists in the database.
    - Confirm if the logged-in user is authorised to delete the record
        (either the creator or an admin).
    - Delete the record from the database.
    - Flash a success message indicating that the record has
        been deleted.
    - Redirect the user to the appropriate page based on the referrer
        (profile page, admin dashboard, or add_record page).

    Args:
        record_id (str): The unique identifier of the record to be deleted.

    Returns:
        Redirect: Redirects to the profile page, admin dashboard,
    """
    # Check if the user is logged in
    if "user" not in session:
        abort(403)  # Forbidden access if the user is not logged in

    # Fetch the record from the database using the record_id
    record = mongo.db.records.find_one({"_id": ObjectId(record_id)})

    # If the record does not exist, abort with a 404 error
    if not record:
        abort(404)  # Record not found

    # Check if the logged-in user is the creator of the record or an admin
    if record["created_by"] != session["user"] and not session.get(
            "is_admin", False):
        abort(403)  # Forbidden access if the user is not authorised

    # Delete the record from the database
    mongo.db.records.delete_one({"_id": ObjectId(record_id)})
    flash("Record Deleted", "Success")

    # Fetch necessary data to render the record page again
    username = session["user"]
    user_records = list(mongo.db.records.find(
            {"created_by": username}))
    site_types = list(mongo.db.site_types.find().sort("site_type", 1))
    periods = list(mongo.db.periods.find())

    # Determine where to redirect based on the referrer
    # retrieve ref from form
    ref = request.args.get('ref')
    if ref == 'profile':
        return redirect(url_for("profile", username=session["user"]))
    elif ref == 'admin_dashboard':
        return redirect(url_for('admin_dashboard'))
    else:
        return redirect(url_for('add_record'))


@app.route("/delete_user/<user_id>")
def delete_user(user_id):
    """
    Handle the deletion of a user by their unique identifier (_id).
    Only Admin can perform this function.

    Process:
    - Verify if the current session belongs to an admin user.
    - Fetch the user from the database using the provided user_id.
    - Check if the user exists in the database.
    - Delete the user from the database.
    - Flash a success message indicating that the user has been deleted.
    - Redirect to the admin dashboard.

    Args:
        user_id (str): The unique identifier of the user to be deleted.

    Returns:
        Redirect: Redirects to the admin dashboard after the user is deleted.
    """
    # Check if the current session belongs to an admin user
    if not session.get("is_admin"):
        abort(403)  # Forbidden access if the user is not an admin

    # Fetch the user from the database using the user_id
    user = mongo.db.users.find_one({"_id": ObjectId(user_id)})

    # If the user does not exist, abort with a 404 error
    if not user:
        abort(404)  # User not found

    # Delete the user from the database
    mongo.db.users.delete_one({"_id": ObjectId(user_id)})

    # Delete all records created by this user
    mongo.db.records.delete_many({"created_by": user["username"]})


    flash("User and all associated records have been deleted", "Success")

    # Redirect to the admin dashboard
    return redirect(url_for('admin_dashboard'))


@app.errorhandler(404)
def forbidden_access(e):
    """
    Handle 404 Not Found errors.

    This function is called when a 404 error (Page Not Found) occurs.
    It renders a custom 404 error page (404.html) to inform the user
    that the requested resource could not be found.

    Args:
        e (Exception): The exception object containing error details.

    Returns:
        Tuple: Rendered template for 404 error page and the error code 404.
    """
    return render_template('404.html'), 404


@app.errorhandler(403)
def page_not_found(e):
    """
    Handle 403 Forbidden errors.

    This function is called when a 403 error (Forbidden Access) occurs.
    It renders a custom 403 error page (403.html) to inform the user
    that they do not have the necessary permissions to access the
    requested resource.

    Args:
        e (Exception): The exception object containing error details.

    Returns:
        Tuple: Rendered template for 403 error page and the error code 403.
    """
    return render_template('403.html'), 403


if __name__ == "__main__":
    app.run(host=os.environ.get("IP"),
            port=int(os.environ.get("PORT")),
            debug=True)
