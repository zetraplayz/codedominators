import os
import sys

# Add the current directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, Base
# Import all models to ensure they are registered with Base.metadata
from app.models import User, Department, Resource, ResourceVersion, ResourcePermission

def init():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init()
