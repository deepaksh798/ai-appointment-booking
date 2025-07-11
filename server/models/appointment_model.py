from pydantic import BaseModel
from datetime import datetime

class Appointment(BaseModel):
    time: datetime
    description: str
