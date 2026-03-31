# Script to initialize database and start the backend Server
echo "Setting up Virtual Environment and DB..."

cd ../
if (-not (Test-Path "venv")) {
    python -m venv venv
}

.\venv\Scripts\Activate.ps1
echo "Installing Requirements..."
pip install -r requirements.txt --quiet

echo "Initializing Database (make sure Postgres is running locally on 5432)..."
python scripts/init_db.py

echo "Starting FastAPI Server..."
uvicorn main:app --reload --host 0.0.0.0 --port 8000
