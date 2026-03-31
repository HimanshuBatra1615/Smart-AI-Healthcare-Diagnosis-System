import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def create_database():
    server = os.getenv("POSTGRES_SERVER", "localhost")
    user = os.getenv("POSTGRES_USER", "postgres")
    password = os.getenv("POSTGRES_PASSWORD", "postgres")
    db_name = os.getenv("POSTGRES_DB", "healthcare_db")

    try:
        # Connect to default postgres database to create the new one
        conn = psycopg2.connect(dbname="postgres", user=user, password=password, host=server.split(":")[0])
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        
        # Check if db exists
        cur.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{db_name}'")
        exists = cur.fetchone()
        
        if not exists:
            print(f"Creating database {db_name}...")
            cur.execute(f"CREATE DATABASE {db_name};")
            print("Database created successfully.")
        else:
            print(f"Database {db_name} already exists.")
            
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error creating database: {e}")
        print("Please ensure PostgreSQL is running locally with user 'postgres' and password 'postgres', or set the POSTGRES_* environment variables.")

if __name__ == "__main__":
    create_database()

