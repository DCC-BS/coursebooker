import datetime
import json
import re
import smtplib
import sqlite3
from email import encoders
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import pytz
import streamlit as st
from icalendar import Calendar, Event, vText


def create_database():
    """Creates the SQLite database and table if they don't exist."""
    conn = sqlite3.connect("registrations.db")
    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS registrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT,
            course_name TEXT,
            course_date TEXT,
            registration_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    conn.commit()
    conn.close()


def add_registration(email, course_name, course_date):
    """Adds a new registration to the database."""
    conn = sqlite3.connect("registrations.db")
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO registrations (email, course_name, course_date) VALUES (?, ?, ?)",
        (email, course_name, course_date),
    )
    conn.commit()
    conn.close()


# --- Helper Functions ---


def load_courses(config_file="config.json"):
    """Loads course data from the config.json file."""
    with open(config_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data["courses"]


def send_email(to_email, subject, body, ics_attachment=None):
    """Sends an email, optionally with an .ics attachment."""
    from_email = "dcc@bs.ch"

    msg = MIMEMultipart()
    msg["From"] = from_email
    msg["To"] = to_email
    msg["Subject"] = subject

    msg.attach(MIMEText(body, "plain"))

    if ics_attachment:
        part = MIMEBase("application", "octet-stream")
        part.set_payload(ics_attachment)
        encoders.encode_base64(part)
        part.add_header(
            "Content-Disposition",
            f"attachment; filename=course_invite.ics",
        )
        msg.attach(part)

    try:
        with smtplib.SMTP("mail.bs.ch") as server:
            server.sendmail(from_email, to_email, msg.as_string())
        return True
    except Exception as e:
        st.error(f"Fehler beim Senden der E-Mail: {e}")
        return False


def create_ics_event(course):
    """Creates an .ics file content for a given course."""
    cal = Calendar()
    cal.add("prodid", "-//Your Course Booking App//mxm.dk//")
    cal.add("version", "2.0")

    event = Event()
    event.add("summary", course["name"])

    dt_format = "%Y-%m-%d %H:%M"
    dtstart = datetime.datetime.strptime(
        f"{course['date']} {course['time']}", dt_format
    )
    dtend = dtstart + datetime.timedelta(hours=course["duration"])

    tz = pytz.timezone("Europe/Berlin")

    event.add("dtstart", dtstart)
    event.add("dtend", dtend)
    event.add("dtstamp", datetime.datetime.now(tz))

    event["location"] = vText(course["location"])
    event.add("description", f"MS Teams Meeting: {course['teams_link']}")

    cal.add_component(event)
    return cal.to_ical()


def validate_email(email):
    """Validates if the email address is in the format firstname.lastname@bs.ch."""
    pattern = r"^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*@(?:bs\.ch|jsd\.bs\.ch|edubs\.ch|iwb\.ch|bvb\.ch)$"
    return re.match(pattern, email) is not None


def image_to_base64(image):
    import base64
    from io import BytesIO

    buffered = BytesIO()
    image.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    return img_str
