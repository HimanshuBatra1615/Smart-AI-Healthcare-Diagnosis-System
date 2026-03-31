from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import List, Dict
import json
import logging
import asyncio
from services.ml_service import predict

router = APIRouter()
logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        try:
            await websocket.send_text(message)
        except Exception as e:
            logger.error(f"Error sending message: {e}")

manager = ConnectionManager()

def extract_potential_symptoms(text: str) -> List[str]:
    # Very basic natural language extraction simulation
    common = ["fever", "cough", "headache", "fatigue", "pain", "nausea", "dizzy", "dizziness", "chills", "sweats"]
    found = []
    text_lower = text.lower()
    for sym in common:
        if sym in text_lower:
            found.append(sym)
    return found

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        await manager.send_personal_message("Hello! I am your AI Health Assistant. Please describe what you are feeling.", websocket)
        
        session_symptoms = set()
        
        while True:
            data = await websocket.receive_text()
            extracted = extract_potential_symptoms(data)
            
            if extracted:
                session_symptoms.update(extracted)
                await asyncio.sleep(1) # Simulate thinking
                response = f"I noted that you're experiencing: {', '.join(extracted)}. "
                if len(session_symptoms) >= 3:
                    response += "I have enough information to form a preliminary analysis. Please check your Diagnosis dashboard."
                else:
                    response += "Are there any other symptoms?"
            else:
                await asyncio.sleep(1)
                import random
                
                # Check if it looks like they are providing duration/severity info
                text_lower = data.lower()
                if any(word in text_lower for word in ["days", "week", "month", "severe", "mild", "time", "much", "lot"]):
                    response = "Thank you for the additional details. Are there any other different symptoms you'd like to add?"
                else:
                    fallbacks = [
                        "I see. Could you provide more specific details, like duration or severity?",
                        "Got it. Is there anything else you are feeling?",
                        "Understood. Are there any accompanying issues we should know about?",
                        "Thanks for sharing. What other symptoms are you experiencing?"
                    ]
                    response = random.choice(fallbacks)
                
            await manager.send_personal_message(response, websocket)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket Error: {e}")
        manager.disconnect(websocket)
