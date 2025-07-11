# from fastapi import FastAPI, Request
# from fastapi.responses import JSONResponse

# app = FastAPI()

# # Store data in a temporary dictionary
# dict_store = {}

# @app.post("/vapi/receive_data")
# async def receive_data(request: Request):
#     try:
#         data = await request.json()

#         if not data or "message" not in data:
#             return JSONResponse(
#                 content={"error": "Invalid request body"},
#                 status_code=400
#             )

#         log_entries = data["message"].get("toolCalls", [])
#         if not log_entries:
#             return JSONResponse(
#                 content={"error": "No toolCalls in message"},
#                 status_code=400
#             )

#         log_id = log_entries[0].get("id")
#         dict_store["id"] = log_entries

#         print("Stored Log Entries:", log_entries)

#         return JSONResponse(
#             content={
#                 "message": "Data received successfully",
#                 "logs": log_entries,
#                 "fullresponse": data,
#             },
#             status_code=200
#         )
#     except Exception as e:
#         print("Error handling request:", str(e))
#         return JSONResponse(
#             content={"error": "Internal Server Error"},
#             status_code=500
#         )


# @app.get("/vapi/get_data")
# async def get_data():
#     try:
#         if "id" not in dict_store:
#             return JSONResponse(
#                 content={"error": "Key 'id' not found in the dictionary"},
#                 status_code=404
#             )

#         appointment_data = dict_store.pop("id")  # remove after returning

#         return JSONResponse(
#             content={
#                 "message": "Appointment data retrieved successfully",
#                 "data": appointment_data,
#             },
#             status_code=200
#         )
#     except Exception as e:
#         print("Error handling request:", str(e))
#         return JSONResponse(
#             content={"error": "Internal Server Error"},
#             status_code=500
#         )
