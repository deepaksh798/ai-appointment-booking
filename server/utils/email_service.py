from mailjet_rest import Client
import os
from datetime import datetime, timedelta

def send_appointment_email(to_email: str, to_name: str, appointment_time: str):
    api_key = os.environ['MJ_APIKEY_PUBLIC']
    api_secret = os.environ['MJ_APIKEY_PRIVATE']
    mailjet = Client(auth=(api_key, api_secret), version='v3.1')

    start_dt = datetime.strptime(appointment_time, "%Y-%m-%d %H:%M UTC")
    end_dt = start_dt + timedelta(minutes=30)

    start_str = start_dt.strftime("%Y%m%dT%H%M%SZ")
    end_str = end_dt.strftime("%Y%m%dT%H%M%SZ")

    google_calendar_link = (
        "https://calendar.google.com/calendar/u/0/r/eventedit"
        f"?text=Meeting+with+{to_name}"
        f"&dates={start_str}/{end_str}"
        f"&details=Your+scheduled+appointment"
        f"&location=Google+Meet"
    )

    data = {
        'Messages': [
            {
                "From": {
                    "Email": "deepak.sh798@gmail.com",  # Replace this
                    "Name": "Appointment Booking"
                },
                "To": [
                    {
                        "Email": to_email,
                        "Name": to_name
                    }
                ],
                "Subject": "Your Appointment is Confirmed",
                "TextPart": f"Your appointment is scheduled for {appointment_time}. Add to Calendar: {google_calendar_link}",
                "HTMLPart": f"""
                    <h3>Hello {to_name},</h3>
                    <p>Your appointment is scheduled for <strong>{appointment_time}</strong> (30 minutes).</p>
                    <p><a href="{google_calendar_link}" target="_blank">📅 Add to Google Calendar</a></p>
                """
            }
        ]
    }

    result = mailjet.send.create(data=data)
    print("Email status:", result.status_code)
    print(result.json())
