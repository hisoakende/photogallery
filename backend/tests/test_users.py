import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User

def test_create_user(client: TestClient, db: Session):
    data = {
        "username": "newuser",
        "email": "new@example.com",
        "password": "newpassword"
    }
    response = client.post("/api/v1/users", json=data)
    assert response.status_code == 201
    content = response.json()
    assert content["username"] == data["username"]
    assert content["email"] == data["email"]
    assert "id" in content
    
    # Check that the user was actually added to the database
    user = db.query(User).filter(User.username == data["username"]).first()
    assert user is not None
    assert user.email == data["email"]

def test_login_access_token(client: TestClient, test_user: User):
    login_data = {
        "username": "testuser",
        "password": "testpassword"
    }
    response = client.post("/api/v1/users/token", data=login_data)
    assert response.status_code == 200
    content = response.json()
    assert "access_token" in content
    assert content["token_type"] == "bearer"

def test_get_me(client: TestClient, token_headers: dict):
    response = client.get("/api/v1/users/me", headers=token_headers)
    assert response.status_code == 200
    content = response.json()
    assert content["username"] == "testuser"
    assert content["email"] == "test@example.com"

def test_update_me(client: TestClient, token_headers: dict, db: Session):
    update_data = {
        "email": "newemail@example.com"
    }
    response = client.put("/api/v1/users/me", headers=token_headers, json=update_data)
    assert response.status_code == 200
    content = response.json()
    assert content["email"] == update_data["email"]
    
    # Check that the user was actually updated in the database
    user = db.query(User).filter(User.username == "testuser").first()
    assert user.email == update_data["email"]

def test_delete_me(client: TestClient, token_headers: dict, db: Session):
    response = client.delete("/api/v1/users/me", headers=token_headers)
    assert response.status_code == 204
    
    # Check that the user was actually deleted from the database
    user = db.query(User).filter(User.username == "testuser").first()
    assert user is None