import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List

router = APIRouter(tags=["stream"])

# A global list to hold active viewing clients
active_viewers: List[WebSocket] = []

@router.websocket("/ws/stream")
async def video_stream(websocket: WebSocket):
    await websocket.accept()
    active_viewers.append(websocket)
    try:
        while True:
            # We keep the connection open.
            await websocket.receive_text()
    except WebSocketDisconnect:
        active_viewers.remove(websocket)
    except Exception:
        if websocket in active_viewers:
            active_viewers.remove(websocket)

@router.websocket("/ws/camera")
async def camera_stream(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Receive bytes from ESP32 camera
            frame = await websocket.receive_bytes()
            # Broadcast the frame to all connected viewers
            for viewer in active_viewers.copy():
                try:
                    await viewer.send_bytes(frame)
                except Exception:
                    pass
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"Camera disconnect: {e}")
