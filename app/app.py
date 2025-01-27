import datetime

import streamlit as st
from PIL import Image
import textwrap
from utils import (
    add_registration,
    create_database,
    create_ics_event,
    image_to_base64,
    load_courses,
    send_email,
    validate_email,
)

st.set_page_config(page_title="Kursbuchung", page_icon=":calendar:")

st.markdown(
    """
    <style>
    /* Increase the font size and make the expander title bold */
    .streamlit-expanderHeader {
        font-size: 20px; /* Adjust the font size as needed */
        font-weight: bold;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

st.title("Kursbuchung")

# Initialize database
create_database()

# Load and group courses
courses = load_courses()
grouped_courses = {}
for course in courses:
    name = course["name"]
    if name not in grouped_courses:
        grouped_courses[name] = []
    grouped_courses[name].append(course)

# User input section
email = st.text_input("Deine E-Mail-Adresse:")

# Display course groups with expandable sections
for group_name, course_list in grouped_courses.items():
    with st.expander(
        f"# **{group_name}**", expanded=(group_name == list(grouped_courses.keys())[0])
    ):  # Expand first group
        st.markdown(f"### Kurs: {group_name}")
        st.markdown("#### Verfügbare Daten")
        for course in course_list:
            course_date_str = course["date"]
            course_time_str = course["time"]

            # Format the date and time for display
            formatted_date_time = datetime.datetime.strptime(
                f"{course_date_str} {course_time_str}", "%Y-%m-%d %H:%M"
            ).strftime("%d.%m.%Y %H:%M")

            label = f"{formatted_date_time} Uhr"
            if st.button(label, key=f"{group_name}-{course_date_str}"):
                if not email:
                    st.warning("Bitte gib deine E-Mail-Adresse ein.")
                elif not validate_email(email):
                    st.error(
                        "Ungültige E-Mail-Adresse. Bitte verwende das Format vorname.nachname@bs.ch."
                    )
                else:
                    # Add registration to database
                    add_registration(email, group_name, course_date_str)

                    # Create ICS file content
                    ics_attachment = create_ics_event(course)
                    name = email.split("@")[0]
                    fist_name, second_name = name.split(".")
                    fist_name = fist_name.title()
                    second_name = second_name.title()

                    # Email body (for user)
                    user_email_body = f"""
                    Hallo {fist_name} {second_name},

                    Vielen Dank für Deine Anmeldung zum Kurs "{group_name}".

                    Kursdetails:
                    - Name: {group_name}
                    - Datum: {course_date_str}
                    - Uhrzeit: {course_time_str}
                    - Ort: {course["location"]}
                    - MS Teams Link: {course["teams_link"]}

                    Im Anhang findest Du eine Kalendereinladung.

                    Wir freuen uns auf Deine Teilnahme!

                    Liebe Grüsse,
                    DCC - Data Competence Center
                    dcc@bs.ch
                    """
                    user_email_body = textwrap.dedent(user_email_body) # Remove leading whitespace

                    # Send email to user
                    send_email(
                        email,
                        f"Anmeldung zum Kurs: {group_name}",
                        user_email_body,
                        ics_attachment,
                    )

                    # Email body (for notification)
                    notification_email_body = f"""
                    Neue Kursanmeldung:

                    - E-Mail: {email}
                    - Kurs: {group_name}
                    - Datum: {course_date_str}
                    """

                    notification_email_body = textwrap.dedent(notification_email_body) # Remove leading whitespace


                    # Send notification email
                    send_email(
                        "yanick.schraner@bs.ch",
                        "Neue Kursanmeldung",
                        notification_email_body,
                    )

                    st.success(
                        f"Anmeldung zum Kurs '{group_name}' am {course_date_str} erfolgreich! Eine Bestätigungs-E-Mail mit Kalendereinladung wurde an {email} gesendet."
                    )

# Create a container for the logo
logo_container = st.container()

# Center the logo within the container
with logo_container:
    col1, col2, col3 = st.columns([1, 1, 1])
    with col2:
        try:
            logo = Image.open("assets/logo.png")

            # Create the HTML for the clickable image link (target="_blank" opens in a new tab)
            logo_html = f'<a href="https://data.bs" target="_blank"><img src="data:image/png;base64,{image_to_base64(logo)}" width="128"></a>'

            # Display the clickable image using st.markdown()
            st.markdown(logo_html, unsafe_allow_html=True)

        except FileNotFoundError:
            st.error(
                "Logo file not found. Please make sure 'logo.png' is in the same directory as the script."
            )
