import os
import pandas as pd
import numpy as np
import pickle
import json
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# 40+ Diseases
DISEASES = [
    "Common Cold", "Influenza", "COVID-19", "Dengue", "Malaria", "Typhoid",
    "Tuberculosis", "Asthma", "Diabetes Type 2", "Hypertension", "Migraine",
    "Anemia", "Pneumonia", "Bronchitis", "Gastroenteritis", "Food Poisoning",
    "Chickenpox", "Measles", "Mumps", "Cholera", "Leptospirosis", "Zika Virus",
    "Chikungunya", "Rabies", "Tetanus", "Hepatitis A", "Hepatitis B", "Hepatitis C",
    "HIV/AIDS", "Syphilis", "Gonorrhea", "Chlamydia", "Herpes", "HPV",
    "Celiac Disease", "Crohn's Disease", "Ulcerative Colitis", "Irritable Bowel Syndrome",
    "Peptic Ulcer", "Gerd", "Appendicitis", "Kidney Stones", "Urinary Tract Infection"
]

# 100+ Symptoms
SYMPTOMS = [
    "fever", "chills", "fatigue", "weakness", "sweating", "night_sweats", "weight_loss",
    "weight_gain", "loss_of_appetite", "increased_appetite", "headache", "dizziness",
    "lightheadedness", "fainting", "confusion", "memory_loss", "difficulty_concentrating",
    "insomnia", "excessive_sleepiness", "blurred_vision", "double_vision", "eye_pain",
    "red_eyes", "watery_eyes", "sensitivity_to_light", "earache", "ringing_in_ears",
    "hearing_loss", "nasal_congestion", "runny_nose", "sneezing", "sore_throat",
    "hoarseness", "dry_cough", "productive_cough", "coughing_up_blood", "shortness_of_breath",
    "wheezing", "chest_pain", "chest_tightness", "fast_heart_rate", "irregular_heartbeat",
    "palpitations", "nausea", "vomiting", "diarrhea", "constipation", "abdominal_pain",
    "bloating", "gas", "indigestion", "heartburn", "difficulty_swallowing", "jaundice",
    "dark_urine", "pale_stools", "blood_in_stool", "frequent_urination", "painful_urination",
    "blood_in_urine", "urinary_incontinence", "muscle_aches", "muscle_cramps", "muscle_weakness",
    "joint_pain", "joint_swelling", "joint_stiffness", "back_pain", "neck_pain",
    "bone_pain", "skin_rash", "itching", "hives", "blisters", "ulcers",
    "bruising_easily", "bleeding_easily", "hair_loss", "nail_changes", "swollen_lymph_nodes",
    "tremors", "seizures", "numbness", "tingling", "paralysis", "difficulty_speaking",
    "difficulty_walking", "loss_of_balance", "loss_of_coordination", "mood_swings",
    "anxiety", "depression", "irritability", "hallucinations", "delusions", "paranoia",
    "phobias", "compulsive_behavior", "hyperactivity", "impulsivity", "loss_of_smell", "loss_of_taste"
]

def generate_dataset(num_samples=10000):
    data = []
    
    # Simple rule based probability matrix for simulation
    for _ in range(num_samples):
        disease = np.random.choice(DISEASES)
        record = {sym: 0 for sym in SYMPTOMS}
        
        # Determine 3 to 10 typical symptoms for the selected disease based on a pseudo-random hash
        np.random.seed(hash(disease) % (2**32))
        typical_symptoms = list(np.random.choice(SYMPTOMS, np.random.randint(3, 10), replace=False))
        
        # Reset seed to truly randomize this instance
        np.random.seed()
        
        # Add typical symptoms with 80% probability
        for sym in typical_symptoms:
            if np.random.rand() > 0.2:
                record[sym] = 1
                
        # Add random noise symptoms with 5% probability
        noise_symptoms = np.random.choice(SYMPTOMS, np.random.randint(0, 4), replace=False)
        for sym in noise_symptoms:
            record[sym] = 1
            
        record['disease'] = disease
        data.append(record)
        
    df = pd.DataFrame(data)
    return df

def train_model():
    print("Generating dataset...")
    df = generate_dataset(15000)
    
    print("Preparing training data...")
    X = df[SYMPTOMS]
    y = df['disease']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Random Forest model...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"Model Accuracy: {acc * 100:.2f}%")
    
    # Save the model
    os.makedirs(os.path.join(os.path.dirname(__file__), '../models/ml'), exist_ok=True)
    model_path = os.path.join(os.path.dirname(__file__), '../models/ml/rf_model.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
        
    # Save the feature names (symptoms)
    features_path = os.path.join(os.path.dirname(__file__), '../models/ml/features.json')
    with open(features_path, 'w') as f:
        json.dump(SYMPTOMS, f)
        
    # Save basic risk mapping logic (purely simulated based on disease severity proxy)
    # Give some diseases a 'High' or 'Emergency' mapping
    risk_mapping = {}
    for i, disease in enumerate(DISEASES):
        hash_val = hash(disease) % 10
        if hash_val > 8:
            risk_mapping[disease] = "Emergency"
        elif hash_val > 6:
            risk_mapping[disease] = "High"
        elif hash_val > 3:
            risk_mapping[disease] = "Medium"
        else:
            risk_mapping[disease] = "Low"
            
    risk_path = os.path.join(os.path.dirname(__file__), '../models/ml/risk_mapping.json')
    with open(risk_path, 'w') as f:
        json.dump(risk_mapping, f)
        
    print(f"Model and artifacts saved to {os.path.abspath('../models/ml')}")

if __name__ == "__main__":
    train_model()
