from fastapi import FastAPI
from app import routes

app = FastAPI(title="ESP32 Web App")

# Include routes
app.include_router(routes.router)

@app.get("/")
def home():
    return {"message": "Welcome to ESP32 Web App"}
