import os
import json
import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# Ensure the ml directory exists
output_dir = os.path.join(os.path.dirname(__file__), '../models/ml')
os.makedirs(output_dir, exist_ok=True)

# 1. Define Features (~100 symptoms)
symptoms = [
    "fever", "cough", "fatigue", "headache", "nausea", "vomiting", "diarrhea",
    "shortness of breath", "chest pain", "dizziness", "chills", "sweating",
    "muscle ache", "joint pain", "sore throat", "runny nose", "congestion",
    "loss of taste", "loss of smell", "abdominal pain", "rash", "itching",
    "swelling", "numbness", "tingling", "weakness", "blurred vision",
    "sensitivity to light", "stiff neck", "confusion", "memory loss",
    "difficulty speaking", "difficulty swallowing", "palpitations",
    "rapid heartbeat", "high blood pressure", "low blood pressure",
    "weight loss", "weight gain", "loss of appetite", "increased appetite",
    "excessive thirst", "frequent urination", "constipation", "bloating",
    "heartburn", "indigestion", "yellow skin", "yellow eyes", "dark urine",
    "pale stools", "easy bruising", "bleeding gums", "nosebleeds",
    "frequent infections", "slow healing", "hair loss", "dry skin",
    "brittle nails", "cold hands", "cold feet", "heat intolerance",
    "cold intolerance", "tremors", "seizures", "fainting", "insomnia",
    "excessive sleepiness", "snoring", "waking up gasping", "mood swings",
    "anxiety", "depression", "irritability", "hallucinations", "delusions",
    "paranoia", "obsessive thoughts", "compulsive behaviors", "panic attacks",
    "phobias", "social withdrawal", "lack of motivation", "feeling worthless",
    "suicidal thoughts", "self-harm", "impulsivity", "hyperactivity",
    "inattention", "learning difficulties", "developmental delays",
    "speech delays", "motor skill delays", "social skill delays",
    "repetitive behaviors", "restricted interests", "sensory sensitivities",
    "poor eye contact", "difficulty understanding emotions"
]
symptoms = sorted(list(set(symptoms)))

# 2. Define Diseases (40 conditions) and their core symptoms
disease_profiles = {
    "Common Cold": {"symptoms": ["cough", "sore throat", "runny nose", "congestion", "fatigue"], "risk": "Low"},
    "Influenza (Flu)": {"symptoms": ["fever", "chills", "muscle ache", "fatigue", "headache", "cough"], "risk": "Medium"},
    "COVID-19": {"symptoms": ["fever", "cough", "shortness of breath", "loss of taste", "loss of smell", "fatigue"], "risk": "Medium"},
    "Migraine": {"symptoms": ["headache", "sensitivity to light", "nausea", "dizziness", "blurred vision"], "risk": "Medium"},
    "Gastroenteritis": {"symptoms": ["nausea", "vomiting", "diarrhea", "abdominal pain", "fever"], "risk": "Medium"},
    "Heart Disease": {"symptoms": ["chest pain", "shortness of breath", "palpitations", "rapid heartbeat", "fatigue", "dizziness"], "risk": "High"},
    "Type 2 Diabetes": {"symptoms": ["excessive thirst", "frequent urination", "weight loss", "fatigue", "blurred vision", "slow healing"], "risk": "Medium"},
    "Hypertension": {"symptoms": ["headache", "dizziness", "blurred vision", "chest pain", "shortness of breath"], "risk": "Medium"},
    "Asthma": {"symptoms": ["shortness of breath", "cough", "chest pain"], "risk": "Medium"},
    "Anemia": {"symptoms": ["fatigue", "weakness", "pale stools", "cold hands", "cold feet", "dizziness", "shortness of breath"], "risk": "Medium"},
    "Hypothyroidism": {"symptoms": ["fatigue", "weight gain", "dry skin", "cold intolerance", "constipation", "muscle ache"], "risk": "Medium"},
    "Hyperthyroidism": {"symptoms": ["weight loss", "rapid heartbeat", "sweating", "heat intolerance", "anxiety", "tremors"], "risk": "Medium"},
    "Allergies": {"symptoms": ["runny nose", "congestion", "itching", "rash", "sore throat"], "risk": "Low"},
    "Anxiety Disorder": {"symptoms": ["anxiety", "palpitations", "sweating", "tremors", "fatigue", "insomnia", "panic attacks"], "risk": "Medium"},
    "Depression": {"symptoms": ["depression", "fatigue", "loss of appetite", "insomnia", "feeling worthless", "lack of motivation"], "risk": "Medium"},
    "Pneumonia": {"symptoms": ["fever", "cough", "shortness of breath", "chest pain", "fatigue", "chills"], "risk": "High"},
    "Bronchitis": {"symptoms": ["cough", "chest pain", "fatigue", "shortness of breath", "fever"], "risk": "Medium"},
    "Sinusitis": {"symptoms": ["headache", "congestion", "runny nose", "fever", "fatigue"], "risk": "Low"},
    "Urinary Tract Infection (UTI)": {"symptoms": ["frequent urination", "abdominal pain", "fever", "fatigue", "dark urine"], "risk": "Medium"},
    "Kidney Stone": {"symptoms": ["abdominal pain", "nausea", "vomiting", "fever", "chills", "dark urine"], "risk": "High"},
    "Food Poisoning": {"symptoms": ["nausea", "vomiting", "diarrhea", "abdominal pain", "fever", "fatigue"], "risk": "Medium"},
    "Appendicitis": {"symptoms": ["abdominal pain", "nausea", "vomiting", "fever", "loss of appetite"], "risk": "Emergency"},
    "Gastric Ulcer": {"symptoms": ["abdominal pain", "heartburn", "indigestion", "nausea", "weight loss"], "risk": "Medium"},
    "Hepatitis": {"symptoms": ["fatigue", "nausea", "vomiting", "abdominal pain", "yellow skin", "yellow eyes", "dark urine"], "risk": "High"},
    "Cirrhosis": {"symptoms": ["fatigue", "weakness", "weight loss", "yellow skin", "yellow eyes", "swelling", "easy bruising"], "risk": "High"},
    "Rheumatoid Arthritis": {"symptoms": ["joint pain", "swelling", "fatigue", "fever", "weight loss"], "risk": "Medium"},
    "Osteoarthritis": {"symptoms": ["joint pain", "stiffness", "swelling", "loss of flexibility"], "risk": "Low"},
    "Osteoporosis": {"symptoms": ["back pain", "loss of height", "bone fracture", "stooped posture"], "risk": "Medium"},
    "Parkinson's Disease": {"symptoms": ["tremors", "stiffness", "slow movement", "balance problems", "speech changes"], "risk": "High"},
    "Alzheimer's Disease": {"symptoms": ["memory loss", "confusion", "difficulty speaking", "mood swings", "personality changes"], "risk": "High"},
    "Multiple Sclerosis": {"symptoms": ["numbness", "tingling", "weakness", "fatigue", "blurred vision", "balance problems", "dizziness"], "risk": "High"},
    "Stroke": {"symptoms": ["numbness", "weakness", "confusion", "difficulty speaking", "blurred vision", "dizziness", "loss of balance", "headache"], "risk": "Emergency"},
    "Heart Attack": {"symptoms": ["chest pain", "shortness of breath", "sweating", "nausea", "vomiting", "dizziness", "pain in arm, back, neck, jaw, stomach"], "risk": "Emergency"},
    "Deep Vein Thrombosis": {"symptoms": ["swelling", "pain", "redness", "warmth"], "risk": "High"},
    "Pulmonary Embolism": {"symptoms": ["shortness of breath", "chest pain", "cough", "rapid heartbeat", "dizziness", "sweating", "fever"], "risk": "Emergency"},
    "Tuberculosis": {"symptoms": ["cough", "chest pain", "fatigue", "weight loss", "fever", "chills", "sweating"], "risk": "High"},
    "Malaria": {"symptoms": ["fever", "chills", "sweating", "headache", "nausea", "vomiting", "muscle ache", "fatigue"], "risk": "High"},
    "Dengue Fever": {"symptoms": ["fever", "headache", "muscle ache", "joint pain", "rash", "nausea", "vomiting"], "risk": "High"},
    "Typhoid Fever": {"symptoms": ["fever", "headache", "weakness", "fatigue", "muscle ache", "sweating", "abdominal pain", "diarrhea", "constipation", "rash"], "risk": "High"},
    "Cholera": {"symptoms": ["diarrhea", "nausea", "vomiting", "muscle cramps", "dehydration"], "risk": "Emergency"}
}

# Add random noise to symptoms to create realistic synthetic variability
print("Generating synthetic dataset...")
data = []
labels = []
risk_mapping = {}

num_samples_per_disease = 300

for disease, info in disease_profiles.items():
    risk_mapping[disease] = info["risk"]
    core_symps = info["symptoms"]
    
    for _ in range(num_samples_per_disease):
        # Base vector of 0s
        vector = {sym: 0 for sym in symptoms}
        
        # Turn on core symptoms with 70-100% chance
        for sym in core_symps:
            if sym in symptoms and np.random.rand() > 0.1:
                vector[sym] = 1
                
        # Turn on random noise symptoms with 1-5% chance (mimicking random unrelated issues)
        noise_symps = np.random.choice(symptoms, size=np.random.randint(0, 5), replace=False)
        for sym in noise_symps:
            vector[sym] = 1
            
        data.append(vector)
        labels.append(disease)

df = pd.DataFrame(data)
X = df
y = np.array(labels)

print(f"Dataset shape: {X.shape}")

# Train Model
print("Training Random Forest Classifier...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.15, random_state=42)

rf = RandomForestClassifier(n_estimators=30, max_depth=10, random_state=42, n_jobs=-1)
rf.fit(X_train, y_train)

# Evaluate
y_pred = rf.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(f"Model Accuracy on Test Set: {acc * 100:.2f}%")

# Save Artifacts
print("Saving model and feature maps...")
with open(os.path.join(output_dir, 'rf_model.pkl'), 'wb') as f:
    pickle.dump(rf, f)

with open(os.path.join(output_dir, 'features.json'), 'w') as f:
    json.dump(list(X.columns), f)
    
with open(os.path.join(output_dir, 'risk_mapping.json'), 'w') as f:
    json.dump(risk_mapping, f)

print(f"Artifacts successfully saved to {output_dir}")
