from fastapi import APIRouter,Depends, HTTPException
from models.appointment_model import Appointment
from utils.jwt_handler import verify_token
from app.database import db
from fastapi.security import OAuth2PasswordBearer

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
    result = await db.appointments.insert_one(appointment_data)
    print("Appointment created with ID:", result.inserted_id)
    return {"message": "Appointment created", "appointment_id": str(result.inserted_id)}

# Get appointments endpoint
@router.get("/appointments")
async def get_appointments(user_id: str = Depends(get_current_user)):
    print("Fetching appointments for user:", user_id)
    appointments = await db.appointments.find({"user_id": user_id}).to_list(length=None)
    print("Found appointments:", appointments)
    return {"appointments": appointments}

# Delete appointment endpoint
@router.delete("/appointments/{appointment_id}")
async def delete_appointment(appointment_id: str, user_id: str = Depends(get_current_user)):
    print("Deleting appointment ID:", appointment_id, "for user:", user_id)
    result = await db.appointments.delete_one({"_id": appointment_id, "user_id": user_id})
    if result.deleted_count == 0:
        print("No appointment found with ID:", appointment_id)
        raise HTTPException(status_code=404, detail="Appointment not found")
    print("Appointment deleted successfully")
    return {"message": "Appointment deleted successfully"}

# Update appointment endpoint
@router.put("/appointments/{appointment_id}")
async def update_appointment(appointment_id: str, appointment: Appointment, user_id: str = Depends(get_current_user)):
    print("Updating appointment ID:", appointment_id, "for user:", user_id, "with data:", appointment)
    update_data = appointment.dict()
    update_data["user_id"] = user_id
    result = await db.appointments.update_one({"_id": appointment_id, "user_id": user_id}, {"$set": update_data})
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

