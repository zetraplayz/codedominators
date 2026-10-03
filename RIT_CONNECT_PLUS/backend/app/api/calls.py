from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import Dict, List, Optional
import json
import logging
from sqlalchemy.orm import Session
from app.core.database import get_db
from app import models
from app.api.auth import get_current_profile

router = APIRouter()

@router.get("/turn-credentials")
def get_turn_credentials(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_profile)):
    # Fetch TURN credentials from SystemSettings
    turn_url = db.query(models.SystemSettings).filter(models.SystemSettings.key == "TURN_SERVER_URL").first()
    turn_username = db.query(models.SystemSettings).filter(models.SystemSettings.key == "TURN_SERVER_USERNAME").first()
    turn_password = db.query(models.SystemSettings).filter(models.SystemSettings.key == "TURN_SERVER_PASSWORD").first()
    
    return {
        "url": turn_url.value if turn_url else "",
        "username": turn_username.value if turn_username else "",
        "password": turn_password.value if turn_password else ""
    }

# Store active connections
# format: room_id -> { client_id -> WebSocket }
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: str, client_id: str):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = {}
        self.active_connections[room_id][client_id] = websocket
        
        # Notify others in the room
        await self.broadcast(room_id, {
            "type": "user_joined",
            "client_id": client_id
        }, exclude=client_id)

    def disconnect(self, room_id: str, client_id: str):
        if room_id in self.active_connections:
            if client_id in self.active_connections[room_id]:
                del self.active_connections[room_id][client_id]
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]

    async def broadcast(self, room_id: str, message: dict, exclude: Optional[str] = None):
        if room_id in self.active_connections:
            for cid, connection in self.active_connections[room_id].items():
                if cid != exclude:
                    try:
                        await connection.send_json(message)
                    except Exception as e:
                        logging.error(f"Error sending message to {cid}: {e}")

    async def send_personal_message(self, message: dict, room_id: str, target_client_id: str):
        if room_id in self.active_connections and target_client_id in self.active_connections[room_id]:
            try:
                await self.active_connections[room_id][target_client_id].send_json(message)
            except Exception as e:
                logging.error(f"Error sending personal message to {target_client_id}: {e}")

manager = ConnectionManager()

@router.websocket("/ws/{room_id}/{client_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, client_id: str):
    await manager.connect(websocket, room_id, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Message structure:
            # {
            #   "type": "offer" | "answer" | "ice_candidate" | "chat",
            #   "target": "target_client_id" (optional for chat),
            #   "payload": ...
            # }
            
            if message.get("target"):
                # Forward signaling data to specific peer
                message["sender"] = client_id
                await manager.send_personal_message(message, room_id, message["target"])
            else:
                # Broadcast to everyone in room (e.g. for general chat or status updates)
                message["sender"] = client_id
                await manager.broadcast(room_id, message, exclude=client_id)
                
    except WebSocketDisconnect:
        manager.disconnect(room_id, client_id)
        await manager.broadcast(room_id, {
            "type": "user_left",
            "client_id": client_id
        })
