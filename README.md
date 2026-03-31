<div align="center">
  
# 🏥 HealthAI - Predictive Healthcare Diagnosis Platform
  
**An intelligent, full-stack AI-powered healthcare diagnostic system built with Next.js, FastAPI, and Advanced Machine Learning.**

[Features](#-features) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [Deployment](#-deployment) 

</div>

---

## 🌟 Overview
HealthAI is a next-generation healthcare platform that bridges the gap between patients and immediate medical insights. By utilizing a finely-tuned Machine Learning model, the system analyzes user-provided symptoms through a real-time conversational AI assistant and predicts potential diseases, severity, and risk levels with remarkable accuracy. 

The intuitive, animated interface ensures a seamless user experience, while the robust FastAPI backend guarantees speed and scalability.

---

## ✨ Features

- **🎙️ Conversational AI Assistant:** Real-time symptom extraction using WebSockets and the Web Speech API (Voice-to-Text).
- **🧠 Predictive Machine Learning:** Utilizes an XGBoost pipeline integrated directly into the Python backend for instant diagnosis prediction.
- **📊 Interactive Vitals Dashboard:** Real-time, glassmorphic UI displaying live ECG animations, Heart Rate, and Blood Pressure.
- **📄 Downloadable PDF Reports:** Professional-grade medical reports mapping diagnosis history, feature importance, and severity graphs.
- **🔐 Secure Authentication:** Seamless JWT-based user authentication and individualized health history tracking.
- **☁️ Cloud-Ready:** Pre-configured for seamless deployment across Vercel, Render, and Neon.

---

## 🏗️ Architecture Stack

### **Frontend**
- **Framework:** Next.js (React)
- **Styling:** Tailwind CSS & Framer Motion for smooth animations
- **State Management:** React Hooks
- **Communication:** Fetch API & native WebSockets

### **Backend**
- **Framework:** FastAPI (Python)
- **Database:** PostgreSQL (SQLAlchemy ORM)
- **Machine Learning:** Scikit-Learn, XGBoost, Pandas
- **Authentication:** OAuth2 with JWT hashing (Passlib/Bcrypt)

---

## 🚀 Getting Started (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/healthcare-system.git
cd healthcare-system
```

### 2. Setup Database (PostgreSQL)
Ensure you have PostgreSQL running locally, or map it to a cloud provider URL via the `.env` file.
Create a `.env` in the `backend/` directory:
```env
DATABASE_URL=postgresql://user:password@localhost/healthcare_db
SECRET_KEY=your_super_secret_jwt_key
```

### 3. Run Backend (FastAPI)
```bash
cd backend
python -m venv venv
# Windows: venv\\Scripts\\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 4. Run Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:3000` to view the application!

---

## 🌐 Deployment (Live Launch)

The codebase is engineered to be hosted securely for free!

1. **Database:** Host your PostgreSQL database instantly via [Neon](https://neon.tech/).
2. **Backend:** Deploy the backend seamlessly via [Render.com](https://render.com/). Make sure to set the Root Directory to `backend` and use the start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`. Update your `DATABASE_URL`!
3. **Frontend:** Deploy via [Vercel](https://vercel.com/). Add an environment variable `NEXT_PUBLIC_API_URL` and point it to your live Render backend URL!

---

<div align="center">
  <i>Developed with ❤️ for the future of Medical Technology.</i>
</div>
