from fastapi import FastAPI
from routes import auth_routes, appointments_routes, message_routes
from fastapi.middleware.cors import CORSMiddleware
from socketio.asgi import ASGIApp
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

# Mount socket.io ASGI app at /ws
app.mount("/ws", ASGIApp(sio, socketio_path="ws"))

# ✅ Global root route
@app.get("/")
def read_root():
    return {"message": "Welcome to the Appointment Booking API"}

app.include_router(auth_routes.router)
app.include_router(appointments_routes.router)
app.include_router(message_routes.router)