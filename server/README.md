## Running the FastAPI Server

From your codebase, the FastAPI instance is defined as `app` in `server/app/main.py`. To run the server, execute the following steps from the `server` directory:

```bash
cd /home/deepak/Desktop/ai-appointment-booking/server
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Access the Application

Once the server is running, open:

* Root route: http://localhost:8000/
* Swagger UI (API docs): http://localhost:8000/docs

### Troubleshooting

If you encounter an import path error, try running:

```bash
PYTHONPATH=. uvicorn app.main:app --reload
```
