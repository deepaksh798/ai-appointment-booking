from fastapi import APIRouter,Depends, HTTPException
from models.appointment_model import Appointment
from utils.jwt_handler import verify_token
from app.database import db
from fastapi.security import OAuth2PasswordBearer
from bson.objectid import ObjectId
from datetime import timedelta, datetime, timezone
from utils.email_service import send_appointment_email

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
    appointment_data = appointment.model_dump()
    appointment_data["user_id"] = user_id

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
            to_name=user.get("name", "User"),
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

