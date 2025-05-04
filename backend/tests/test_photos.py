import pytest
import io
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.photo import Photo
from app.models.album import Album

@pytest.fixture
def test_album(db: Session, test_user: dict):
    album = Album(
        title="Test Album",
        description="Test Description",
        user_id=test_user.id
    )
    db.add(album)
    db.commit()
    db.refresh(album)
    return album

def test_upload_photo(client: TestClient, token_headers: dict, db: Session):
    # Create test file
    file_content = b"test file content"
    file = {"file": ("test.jpg", io.BytesIO(file_content), "image/jpeg")}
    
    # Create test data
    data = {
        "title": "Test Photo",
        "description": "Test Description"
    }
    
    response = client.post(
        "/api/v1/photos",
        headers=token_headers,
        files=file,
        data=data
    )
    
    assert response.status_code == 201
    content = response.json()
    assert content["title"] == data["title"]
    assert content["description"] == data["description"]
    assert "id" in content
    assert "file_path" in content
    
    # Check that the photo was actually added to the database
    photo = db.query(Photo).filter(Photo.id == content["id"]).first()
    assert photo is not None
    assert photo.title == data["title"]
    assert photo.description == data["description"]

def test_get_photo(client: TestClient, token_headers: dict, db: Session, test_user: dict):
    # Create a test photo
    photo = Photo(
        title="Test Photo",
        description="Test Description",
        file_path="test_uploads/test.jpg",
        user_id=test_user.id
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)
    
    response = client.get(f"/api/v1/photos/{photo.id}", headers=token_headers)
    
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == photo.title
    assert content["description"] == photo.description
    assert content["id"] == photo.id
    assert "owner" in content
    assert "comments" in content

def test_update_photo(client: TestClient, token_headers: dict, db: Session, test_user: dict):
    # Create a test photo
    photo = Photo(
        title="Test Photo",
        description="Test Description",
        file_path="test_uploads/test.jpg",
        user_id=test_user.id
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)
    
    update_data = {
        "title": "Updated Title",
        "description": "Updated Description"
    }
    
    response = client.put(
        f"/api/v1/photos/{photo.id}",
        headers=token_headers,
        json=update_data
    )
    
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == update_data["title"]
    assert content["description"] == update_data["description"]
    
    # Check that the photo was actually updated in the database
    db.refresh(photo)
    assert photo.title == update_data["title"]
    assert photo.description == update_data["description"]

def test_add_photo_to_album(client: TestClient, token_headers: dict, db: Session, test_user: dict, test_album: Album):
    # Create a test photo
    photo = Photo(
        title="Test Photo",
        description="Test Description",
        file_path="test_uploads/test.jpg",
        user_id=test_user.id
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)
    
    response = client.post(
        f"/api/v1/photos/{photo.id}/albums/{test_album.id}",
        headers=token_headers
    )
    
    assert response.status_code == 200
    
    # Check that the photo was actually added to the album
    db.refresh(photo)
    assert test_album in photo.albums