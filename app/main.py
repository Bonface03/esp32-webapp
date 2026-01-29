from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles   # <-- add this import
from app import routes

app = FastAPI(title="ESP32 Web App")

# Include backend routes
app.include_router(routes.router)

# Serve frontend files (index.html, style.css, app.js)
# Make sure you have a folder called "frontend" in your project root
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")
