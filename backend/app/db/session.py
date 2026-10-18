import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# 1. Absolute path setup to force-create database file in the backend root directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATABASE_FILE_PATH = os.path.join(BASE_DIR, "easyloan.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DATABASE_FILE_PATH}"

print(f"--> Target Database Path: {DATABASE_FILE_PATH}")

# 2. Engine configuration with multithreading support for SQLite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}
)

# 3. Database Session Factory configuration
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. Base class declarative mapping system for models
Base = declarative_base()

# 5. FastAPI Dependency Injection yield generator
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
