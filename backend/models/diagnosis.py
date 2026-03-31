from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from db.base import Base

class Diagnosis(Base):
    __tablename__ = "diagnoses"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    symptoms = Column(JSON, nullable=False)  # List of symptoms entered
    predicted_disease = Column(String, nullable=False)
    confidence_score = Column(Float, nullable=False)
    feature_importance = Column(JSON, nullable=True)  # Explainable AI mapping
    risk_level = Column(String, nullable=True) # Low, Medium, High, Emergency
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="diagnoses")
