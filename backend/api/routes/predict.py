from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from db.session import get_db
from models.user import User
from models.diagnosis import Diagnosis
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from core.config import settings
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

class SymptomInput(BaseModel):
    symptoms: List[str]

class PredictionResponse(BaseModel):
    diagnosis_id: int
    disease: str
    probability: float
    risk_level: str
    feature_importance: Dict[str, float]

@router.post("/", response_model=PredictionResponse)
def predict_disease(input_data: SymptomInput, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from services.ml_service import predict
    
    logger.info(f"User {current_user.email} requesting prediction for {len(input_data.symptoms)} symptoms")
    
    # 1. Run ML Prediction
    try:
        result = predict(input_data.symptoms)
    except Exception as e:
        logger.error(f"Prediction failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Error generating prediction")
    
    logger.info(f"Prediction result: {result['disease']} with probability {result['probability']}")
    
    # 2. Save prediction mapping to PostgreSQL Database
    db_diagnosis = Diagnosis(
        user_id=current_user.id,
        symptoms=input_data.symptoms,
        predicted_disease=result["disease"],
        confidence_score=result["probability"],
        feature_importance=result["feature_importance"],
        risk_level=result["risk_level"],
        created_at=datetime.utcnow()
    )
    db.add(db_diagnosis)
    db.commit()
    db.refresh(db_diagnosis)
    
    # 3. Return the payload with ID
    return {
        "diagnosis_id": db_diagnosis.id,
        "disease": db_diagnosis.predicted_disease,
        "probability": db_diagnosis.confidence_score,
        "risk_level": db_diagnosis.risk_level,
        "feature_importance": db_diagnosis.feature_importance
    }

@router.get("/history", response_model=List[PredictionResponse])
def get_diagnosis_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    diagnoses = db.query(Diagnosis).filter(Diagnosis.user_id == current_user.id).order_by(Diagnosis.created_at.desc()).limit(20).all()
    history = []
    for diag in diagnoses:
        history.append({
            "diagnosis_id": diag.id,
            "disease": diag.predicted_disease,
            "probability": diag.confidence_score,
            "risk_level": diag.risk_level,
            "feature_importance": diag.feature_importance
        })
    return history

@router.get("/{diagnosis_id}", response_model=PredictionResponse)
def get_diagnosis(diagnosis_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    logger.info(f"User {current_user.email} fetching diagnosis {diagnosis_id}")
    diagnosis = db.query(Diagnosis).filter(Diagnosis.id == diagnosis_id, Diagnosis.user_id == current_user.id).first()
    
    if not diagnosis:
        logger.warning(f"Diagnosis {diagnosis_id} not found for user {current_user.email}")
        raise HTTPException(status_code=404, detail="Diagnosis not found")
        
    return {
        "diagnosis_id": diagnosis.id,
        "disease": diagnosis.predicted_disease,
        "probability": diagnosis.confidence_score,
        "risk_level": diagnosis.risk_level,
        "feature_importance": diagnosis.feature_importance
    }
