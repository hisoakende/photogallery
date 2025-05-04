import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.album import Album
from app.models.user import User

def test_create_album(client: TestClient, token_headers: dict, db: Session):
    data = {
        "title": "Test Album",
        "description": "Test Description"
    }
    
    response = client.post(
        "/api/v1/albums",
        headers=token_headers,
        json=data
    )
    
    assert response.status_code == 201
    content = response.json()
    assert content["title"] == data["title"]
    assert content["description"] == data["description"]
    assert "id" in content
    
    # Check that the album was actually added to the database
    album = db.query(Album).filter(Album.id == content["id"]).first()
    assert album is not None
    assert album.title == data["title"]
    assert album.description == data["description"]

def test_get_album(client: TestClient, token_headers: dict, db: Session, test_user: dict):
    # Create a test album
    album = Album(
        title="Test Album",
        description="Test Description",
        user_id=test_user.id
    )
    db.add(album)
    db.commit()
    db.refresh(album)
    
    response = client.get(f"/api/v1/albums/{album.id}", headers=token_headers)
    
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == album.title
    assert content["description"] == album.description
    assert content["id"] == album.id
    assert "owner" in content
    assert "photos" in content

def test_update_album(client: TestClient, token_headers: dict, db: Session, test_user: dict):
    # Create a test album
    album = Album(
        title="Test Album",
        description="Test Description",
        user_id=test_user.id
    )
    db.add(album)
    db.commit()
    db.refresh(album)
    
    update_data = {
        "title": "Updated Title",
        "description": "Updated Description"
    }
    
    response = client.put(
        f"/api/v1/albums/{album.id}",
        headers=token_headers,
        json=update_data
    )
    
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == update_data["title"]
    assert content["description"] == update_data["description"]
    
    # Check that the album was actually updated in the database
    db.refresh(album)
    assert album.title == update_data["title"]
    assert album.description == update_data["description"]

def test_delete_album(client: TestClient, token_headers: dict, db: Session, test_user: dict):
    # Create a test album
    album = Album(
        title="Test Album",
        description="Test Description",
        user_id=test_user.id
    )
    db.add(album)
    db.commit()
    db.refresh(album)
    
    response = client.delete(f"/api/v1/albums/{album.id}", headers=token_headers)
    
    assert response.status_code == 204
    
    # Check that the album was actually deleted from the database
    deleted_album = db.query(Album).filter(Album.id == album.id).first()
    assert deleted_album is None

def test_create_private_album(client: TestClient, token_headers: dict, db: Session):
    data = {
        "title": "Private Album",
        "description": "This is a private album",
        "is_private": True
    }
    
    response = client.post(
        "/api/v1/albums",
        headers=token_headers,
        json=data
    )
    
    assert response.status_code == 201
    content = response.json()
    assert content["title"] == data["title"]
    assert content["description"] == data["description"]
    assert content["is_private"] == data["is_private"]
    assert "id" in content
    
    # Check that the album was actually added to the database
    album = db.query(Album).filter(Album.id == content["id"]).first()
    assert album is not None
    assert album.title == data["title"]
    assert album.description == data["description"]
    assert album.is_private == data["is_private"]

def test_create_private_album(client: TestClient, token_headers: dict, db: Session):
    data = {
        "title": "Private Album",
        "description": "This is a private album",
        "is_private": True
    }
    
    response = client.post(
        "/api/v1/albums",
        headers=token_headers,
        json=data
    )
    
    assert response.status_code == 201
    content = response.json()
    assert content["title"] == data["title"]
    assert content["description"] == data["description"]
    assert content["is_private"] == data["is_private"]
    assert "id" in content
    
    # Check that the album was actually added to the database
    album = db.query(Album).filter(Album.id == content["id"]).first()
    assert album is not None
    assert album.title == data["title"]
    assert album.description == data["description"]
    assert album.is_private == data["is_private"]


def test_access_private_album(client: TestClient, token_headers: dict, db: Session, test_user: dict):
    # Create a private album
    album = Album(
        title="Private Album",
        description="This is a private album",
        is_private=True,
        user_id=test_user.id
    )
    db.add(album)
    db.commit()
    db.refresh(album)
    
    # Owner should be able to access it
    response = client.get(f"/api/v1/albums/{album.id}", headers=token_headers)
    assert response.status_code == 200
    
    # Create a second user who should not be able to access it
    from app.core.security import get_password_hash
    user2 = User(
        username="anotheruser",
        email="another@example.com",
        hashed_password=get_password_hash("testpassword"),
        is_active=True
    )
    db.add(user2)
    db.commit()
    db.refresh(user2)
    
    # Login as the second user
    login_data = {
        "username": "anotheruser",
        "password": "testpassword"
    }
    response = client.post("/api/v1/users/token", data=login_data)
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Try to access the private album
    response = client.get(f"/api/v1/albums/{album.id}", headers=headers)
    assert response.status_code == 403
