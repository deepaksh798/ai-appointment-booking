from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()
print("Loading MongoDB URI from environment variable...")
client = AsyncIOMotorClient(os.getenv("MONGO_URI"))
db = client["ai-appointment-db"]