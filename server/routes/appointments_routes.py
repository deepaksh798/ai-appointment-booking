from fastapi import APIRouter,Depends, HTTPException
from models.appointment_model import Appointment
from utils.jwt_handler import verify_token
from app.database import db
from fastapi.security import OAuth2PasswordBearer
from bson.objectid import ObjectId
from datetime import timedelta, datetime, timezone
from utils.email_service import send_appointment_email
from fastapi import Request

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    print("Token received:", token)
    user_id = verify_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid Token")
    return user_id

# Create appointment endpoint
@router.post("/add-appointment")
async def create_appointment(appointment: Appointment, user_id: str = Depends(get_current_user)):
    print("Creating appointment for user:", user_id, "with data:", appointment)
    appointment_data = appointment.model_dump() # model_dump() is used to convert Pydantic model to dict
    appointment_data["user_id"] = user_id
    created_at = datetime.now(timezone.utc)
    appointment_data["created_at"] = created_at

    if appointment.time < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Cannot book an appointment in the past.")

    start_time = appointment.time - timedelta(minutes=30)
    end_time = appointment.time + timedelta(minutes=30)

    check_existing = await db.appointments.find_one({
        "user_id": user_id,
        "time": {"$gte": start_time, "$lt": end_time}
    })

    if check_existing:
        raise HTTPException(status_code=400, detail="An appointment already exists within 30 minutes of the requested time.")

    result = await db.appointments.insert_one(appointment_data)
    print("Appointment created with ID:", result.inserted_id)

    # Fetch user email and name from users collection
    print("uuser_id for email fetch:", user_id)
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    print("User details fetched for email:", user)
    if user and user.get("email"):
        send_appointment_email(
            to_email=user["email"],
            to_name=user.get("name") or "User",
            appointment_time=appointment.time.strftime("%Y-%m-%d %H:%M UTC")
        )

    return {"message": "Appointment created", "appointment_id": str(result.inserted_id)}

# Get appointments endpoint
@router.get("/appointments")
async def get_appointments(user_id: str = Depends(get_current_user)):
    print("Fetching appointments for user:", user_id)
    appointments = await db.appointments.find({"user_id": user_id}).to_list(length=None)
    # Convert ObjectId to string for each appointment
    for appt in appointments:
        appt["_id"] = str(appt["_id"])
    print("Found appointments:", appointments)
    return {"appointments": appointments}

# Delete appointment endpoint
@router.delete("/appointments/{appointment_id}")
async def delete_appointment(appointment_id: str, user_id: str = Depends(get_current_user)):
    print("Deleting appointment ID:", appointment_id, "for user:", user_id)
    try:
        obj_id = ObjectId(appointment_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid appointment ID format")
    result = await db.appointments.delete_one({"_id": obj_id, "user_id": user_id})
    print("Delete result:", result)
    if result.deleted_count == 0:
        print("No appointment found with ID:", appointment_id)
        raise HTTPException(status_code=404, detail="Appointment not found")
    print("Appointment deleted successfully")
    return {"message": "Appointment deleted successfully"}

# Update appointment endpoint
@router.put("/appointments/{appointment_id}")
async def update_appointment(appointment_id: str, appointment: Appointment, user_id: str = Depends(get_current_user)):
    print("Updating appointment ID:", appointment_id, "for user:", user_id, "with data:", appointment)

    try:
        obj_id = ObjectId(appointment_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid appointment ID format")

    # Prevent updating to a past time
    if appointment.time < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Cannot update appointment to a past date/time.")

    # New appointment time
    appointment_data = appointment.model_dump()
    appointment_data["user_id"] = user_id
    new_time = appointment.time

    # Define time window (±30 minutes)
    start_time = new_time - timedelta(minutes=30)
    end_time = new_time + timedelta(minutes=30)

    # Check for conflicting appointments (excluding the one being updated)
    check_conflict = await db.appointments.find_one({
        "user_id": user_id,
        "_id": {"$ne": obj_id},  # Exclude current appointment
        "time": {"$gte": start_time, "$lt": end_time}
    })

    if check_conflict:
        raise HTTPException(status_code=400, detail="Another appointment exists within 30 minutes of the new time.")

    # Proceed to update
    result = await db.appointments.update_one(
        {"_id": obj_id, "user_id": user_id},
        {"$set": appointment_data}
    )

    print("Update result:", result)

    if result.modified_count == 0:
        print("No appointment found with ID:", appointment_id)
        raise HTTPException(status_code=404, detail="Appointment not found or no changes made")

    print("Appointment updated successfully")
    return {"message": "Appointment updated successfully"}

# Get appointment by ID endpoint
@router.get("/appointments/{appointment_id}")
async def get_appointment(appointment_id: str, user_id: str = Depends(get_current_user)):
    print("Fetching appointment ID:", appointment_id, "for user:", user_id)
    appointment = await db.appointments.find_one({"_id": appointment_id, "user_id": user_id})
    if not appointment:
        print("No appointment found with ID:", appointment_id)
        raise HTTPException(status_code=404, detail="Appointment not found")
    print("Found appointment:", appointment)
    return {"appointment": appointment}


@router.post("/vapi-webhook")
async def handle_vapi_call(request: Request):
    payload = await request.json()
    message = payload.get("message", {})

    print("Received payload:", payload)

    # 1. Check if Vapi is calling the 'bookAppointment' tool
    if message.get("type") == "tool-calls":
        tool_call = message.get("toolCalls")[0]
        args = tool_call.get("function", {}).get("arguments", {})
        

        metadata = message.get("artifact", {}).get("metadata", {})
        user_id = metadata.get("userId")

        if not user_id:
            return {"results": [{"toolCallId": tool_call["id"], "error": "User ID missing"}]}

        # 3. Process the data
        try:
            # Vapi send time in ISO format
            apt_time_str = args.get("dateAndTime")
            apt_time = datetime.fromisoformat(apt_time_str.replace("Z", "+00:00"))
            
            # 4. Check for Conflicts (Your existing logic)
            start_time = apt_time - timedelta(minutes=30)
            end_time = apt_time + timedelta(minutes=30)

            check_existing = await db.appointments.find_one({
                "time": {"$gte": start_time, "$lt": end_time} # gte: greater than or equal to, lt: less than
            })

            if check_existing:
                return {
                    "results": [{
                        "toolCallId": tool_call["id"], 
                        "result": "Sorry, that slot is already taken."
                    }]
                }

            # 5. Save to Database
            appointment_doc = {
                "user_id": user_id,
                "time": apt_time,
                "purpose": args.get("purpose", "General Consultation"),
                "created_at": datetime.now(timezone.utc)
            }
            print("Inserting appointment document:", appointment_doc)
            
            await db.appointments.insert_one(appointment_doc)

            # 6. Trigger Email
            user = await db.users.find_one({"_id": ObjectId(user_id)})
            if user and user.get("email"):
                send_appointment_email(
                    to_email=user["email"],
                    to_name=user.get("name", "User"),
                    appointment_time=apt_time.strftime("%Y-%m-%d %H:%M")
                )

            return {
                "results": [{
                    "toolCallId": tool_call["id"], 
                    "result": "Appointment booked successfully!"
                }]
            }

        except Exception as e:
            print(f"Error processing voice booking: {e}")
            return {"results": [{"toolCallId": tool_call["id"], "error": str(e)}]}

    return {"status": "ignored"}
