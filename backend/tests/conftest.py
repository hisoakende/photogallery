import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base
from app.dependencies import get_db
from app.main import app
from app.core.security import get_password_hash
from app.models.user import User

# Use in-memory SQLite for tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create temp upload directory for testing
TEST_UPLOAD_DIR = "test_uploads"
os.environ["UPLOAD_DIRECTORY"] = TEST_UPLOAD_DIR
os.makedirs(TEST_UPLOAD_DIR, exist_ok=True)

@pytest.fixture(scope="function")
def db():
    # Create the database
    Base.metadata.create_all(bind=engine)
    
    # Run the tests
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        
    # Drop the database
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db):
    # Override the get_db dependency
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as c:
        yield c
    
    # Reset dependency overrides after test
    app.dependency_overrides = {}

@pytest.fixture(scope="function")
def test_user(db):
    user = User(
        username="testuser",
        email="test@example.com",
        hashed_password=get_password_hash("testpassword"),
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture(scope="function")
def token_headers(client, test_user):
    login_data = {
        "username": "testuser",
        "password": "testpassword"
    }
    response = client.post("/api/v1/users/token", data=login_data)
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    return headers