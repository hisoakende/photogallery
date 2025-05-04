import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.comment import Comment
from app.models.photo import Photo

@pytest.fixture
def test_photo(db: Session, test_user: dict):
    photo = Photo(
        title="Test Photo",
        description="Test Description",
        file_path="test_uploads/test.jpg",
        user_id=test_user.id
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return photo

def test_create_comment(client: TestClient, token_headers: dict, db: Session, test_photo: Photo):
    data = {
        "text": "Test Comment",
        "photo_id": test_photo.id
    }
    
    response = client.post(
        "/api/v1/comments",
        headers=token_headers,
        json=data
    )
    
    assert response.status_code == 201
    content = response.json()
    assert content["text"] == data["text"]
    assert content["photo_id"] == data["photo_id"]
    assert "id" in content
    
    # Check that the comment was actually added to the database
    comment = db.query(Comment).filter(Comment.id == content["id"]).first()
    assert comment is not None
    assert comment.text == data["text"]
    assert comment.photo_id == data["photo_id"]

def test_get_photo_comments(client: TestClient, token_headers: dict, db: Session, test_user: dict, test_photo: Photo):
    # Create test comments
    comment1 = Comment(
        text="Test Comment 1",
        user_id=test_user.id,
        photo_id=test_photo.id
    )
    comment2 = Comment(
        text="Test Comment 2",
        user_id=test_user.id,
        photo_id=test_photo.id
    )
    db.add(comment1)
    db.add(comment2)
    db.commit()
    
    response = client.get(f"/api/v1/comments/photo/{test_photo.id}", headers=token_headers)
    
    assert response.status_code == 200
    content = response.json()
    assert len(content) == 2
    assert content[0]["text"] == "Test Comment 1"
    assert content[1]["text"] == "Test Comment 2"
    assert "user" in content[0]
    assert "user" in content[1]

def test_update_comment(client: TestClient, token_headers: dict, db: Session, test_user: dict, test_photo: Photo):
    # Create a test comment
    comment = Comment(
        text="Test Comment",
        user_id=test_user.id,
        photo_id=test_photo.id
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    
    update_data = {
        "text": "Updated Comment"
    }
    
    response = client.put(
        f"/api/v1/comments/{comment.id}",
        headers=token_headers,
        json=update_data
    )
    
    assert response.status_code == 200
    content = response.json()
    assert content["text"] == update_data["text"]
    
    # Check that the comment was actually updated in the database
    db.refresh(comment)
    assert comment.text == update_data["text"]

def test_delete_comment(client: TestClient, token_headers: dict, db: Session, test_user: dict, test_photo: Photo):
    # Create a test comment
    comment = Comment(
        text="Test Comment",
        user_id=test_user.id,
        photo_id=test_photo.id
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    
    response = client.delete(f"/api/v1/comments/{comment.id}", headers=token_headers)
    
    assert response.status_code == 204
    
    # Check that the comment was actually deleted from the database
    deleted_comment = db.query(Comment).filter(Comment.id == comment.id).first()
    assert deleted_comment is None