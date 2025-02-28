import datetime
import textwrap
import streamlit as st
from PIL import Image
from utils import (
    add_registration,
    create_database,
    create_ics_event,
    image_to_base64,
    load_courses,
    send_email,
    validate_email,
)
import csv
import os

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

# Initialize session state variables if they don't exist
if 'selected_course' not in st.session_state:
    st.session_state.selected_course = None
if 'selected_date' not in st.session_state:
    st.session_state.selected_date = None
if 'selected_course_organizer' not in st.session_state:
    st.session_state.selected_course_organizer = None

st.subheader("Verfügbare Kurse", divider="gray")

# Display course groups with expandable sections
for group_name, course_list in grouped_courses.items():
    with st.expander(f"# **{group_name}**", expanded=False):
        st.markdown(f"### Kurs: {group_name}")

        # Access the first course in the list to display general information (assuming they are the same for all courses in the group)
        course = course_list[0]
        organizer_mail = course['organizer_mail']
        st.markdown(
            f"""
            **Kursbeschreibung:** {course["description"]}\n
            **Dauer:** {course["duration"]}h\n
            **Ort:** {course["location"]}\n
            """
        )
        st.markdown("#### Verfügbare Daten")

        date_options = []
        for course in course_list:
            course_date_str = course["date"]
            course_time_str = course["time"]
            course_duration = course["duration"]

            # Calculate end time
            start_datetime = datetime.datetime.strptime(f"{course_date_str} {course_time_str}", "%Y-%m-%d %H:%M")

            # Check if the course is in the past
            if start_datetime < datetime.datetime.now():
                continue  # Skip courses in the past

            end_datetime = start_datetime + datetime.timedelta(hours=course_duration)

            # Format the date and time for display
            formatted_start_time = start_datetime.strftime("%d.%m.%Y %H:%M")
            formatted_end_time = end_datetime.strftime("%H:%M Uhr")
            formatted_date_time = f"{formatted_start_time} - {formatted_end_time}"

            date_options.append((formatted_date_time, course_date_str, course_time_str))

        if not date_options:
            st.write("Keine zukünftigen Termine für diesen Kurs verfügbar.")
            continue

        # Use a selectbox for date selection
        selected_formatted_date, selected_course_date, selected_course_time = st.selectbox(
            "Wähle ein Datum",
            date_options,
            key=f"selectbox-{group_name}",
            format_func=lambda x: x[0]  # Display the formatted date in the selectbox
        )

        if st.button(f"Kurs Buchen: {selected_formatted_date}", key=f"book-{group_name}-{selected_course_date}"):
            st.session_state.selected_course = group_name
            st.session_state.selected_date = selected_course_date
            st.session_state.selected_time = selected_course_time
            st.session_state.selected_course_organizer = organizer_mail
            st.rerun()


# Booking logic (triggered when session state is updated)
if st.session_state.selected_course and st.session_state.selected_date and st.session_state.selected_time:
    if not email:
        st.warning("Bitte gib deine E-Mail-Adresse ein.")
        st.session_state.selected_course = None
        st.session_state.selected_date = None
        st.session_state.selected_time = None

    elif not validate_email(email):
        st.error(
            "Ungültige E-Mail-Adresse. Bitte verwende das Format vorname.nachname@bs.ch."
        )
        st.session_state.selected_course = None
        st.session_state.selected_date = None
        st.session_state.selected_time = None

    else:
        # Find the selected course details
        selected_course_details = next((c for c in courses if c["name"] == st.session_state.selected_course and c["date"] == st.session_state.selected_date), None)

        if selected_course_details:
            # Add registration to database
            add_registration(email, st.session_state.selected_course, st.session_state.selected_date)

            # --- CSV Logic ---
            csv_file_path = './data/registrations.csv'
            
            # Check if the file exists, create it if it doesn't
            file_exists = os.path.isfile(csv_file_path)
            
            with open(csv_file_path, mode='a', newline='', encoding='utf-8') as file:
                writer = csv.writer(file)
                
                # Write header row if the file is newly created
                if not file_exists:
                    writer.writerow(['email', 'course_name', 'course_date'])
                
                # Write the registration data
                writer.writerow([email, st.session_state.selected_course, st.session_state.selected_date])
            # --- End CSV Logic ---

            # Create ICS file content
            ics_attachment = create_ics_event(selected_course_details)
            name = email.split("@")[0]

            try:
                fist_name, second_name = name.split(".")
            except ValueError:
                fist_name = name
                second_name = ""

            fist_name = fist_name.title()
            second_name = second_name.title()
            course_time_str = selected_course_details["time"]

            # Calculate end time for email
            start_datetime = datetime.datetime.strptime(f"{st.session_state.selected_date} {course_time_str}", "%Y-%m-%d %H:%M")
            end_datetime = start_datetime + datetime.timedelta(hours=selected_course_details["duration"])
            formatted_end_time = end_datetime.strftime("%H:%M Uhr")

            # Email body (for user)
            user_email_body = f"""
            Hallo {fist_name} {second_name},

            Vielen Dank für Deine Anmeldung zum Kurs "{st.session_state.selected_course}".

            Kursdetails:
            - Name: {st.session_state.selected_course}
            - Datum: {st.session_state.selected_date}
            - Uhrzeit: {course_time_str} - {formatted_end_time}
            - Ort: {selected_course_details["location"]}
            - MS Teams Link: {selected_course_details["teams_link"]}

            Im Anhang findest Du eine Kalendereinladung.

            Wir freuen uns auf Deine Teilnahme!

            Liebe Grüsse,
            DCC - Data Competence Center
            dcc@bs.ch
            """
            user_email_body = textwrap.dedent(user_email_body)  # Remove leading whitespace

            # Send email to user
            send_email(
                email,
                f"Kursanmeldung: {st.session_state.selected_course}",
                user_email_body,
                ics_attachment,
            )

            # Email body (for notification)
            notification_email_body = f"""
            Neue Kursanmeldung:

            - E-Mail: {email}
            - Kurs: {st.session_state.selected_course}
            - Datum: {st.session_state.selected_date}
            """

            notification_email_body = textwrap.dedent(notification_email_body)  # Remove leading whitespace

            # Send notification email
            send_email(
                st.session_state.selected_course_organizer,
                f"Kursanmeldung: {st.session_state.selected_course}",
                notification_email_body,
            )

            st.success(
                f"Anmeldung zum Kurs '{st.session_state.selected_course}' am {st.session_state.selected_date} erfolgreich! Eine Bestätigungs-E-Mail mit Kalendereinladung wurde an {email} gesendet."
            )

            # Reset session state after successful booking
            st.session_state.selected_course = None
            st.session_state.selected_date = None
            st.session_state.selected_time = None


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