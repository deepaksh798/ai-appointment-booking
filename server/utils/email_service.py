from mailjet_rest import Client
import os

def send_appointment_email(to_email: str, to_name: str, appointment_time: str):
    api_key = os.environ['MJ_APIKEY_PUBLIC']
    api_secret = os.environ['MJ_APIKEY_PRIVATE']
    mailjet = Client(auth=(api_key, api_secret), version='v3.1')

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
                "TextPart": f"Your appointment is scheduled for {appointment_time}",
                "HTMLPart": f"<h3>Hello {to_name},</h3><p>Your appointment is scheduled for <strong>{appointment_time}</strong>.</p>"
            }
        ]
    }

    result = mailjet.send.create(data=data)
    print("Email status:", result.status_code)
    print(result.json())
