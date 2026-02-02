from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app import routes
from app.db import Base, engine

# Create database tables on startup
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(title="ESP32 Web App")

# Include backend routes (register, login, protected, admin)
app.include_router(routes.router)

# Serve frontend files (index.html, style.css, app.js)
# Make sure you have a folder called "frontend" in your project root
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")
