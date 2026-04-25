from fastapi import FastAPI
import socketio
from routes import auth_routes, appointments_routes, message_routes
from fastapi.middleware.cors import CORSMiddleware
from utils.socket_manager import sio


app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# ✅ Global root route
@app.get("/")
def read_root():
    return {"message": "Welcome to the Appointment Booking API"}

app.include_router(auth_routes.router)
app.include_router(appointments_routes.router)
app.include_router(message_routes.router)

# Socket.IO endpoint is available at /ws
app = socketio.ASGIApp(sio, other_asgi_app=app, socketio_path="ws")