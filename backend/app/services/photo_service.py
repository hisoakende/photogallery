import os
import uuid
from datetime import datetime
from fastapi import UploadFile
from sqlalchemy.orm import Session
from typing import Optional, List

from app.models.photo import Photo
from app.schemas.photo import PhotoCreate, PhotoUpdate
from app.config import settings

def get_photo(db: Session, photo_id: int) -> Optional[Photo]:
    return db.query(Photo).filter(Photo.id == photo_id).first()

def get_photos(db: Session, skip: int = 0, limit: int = 100) -> List[Photo]:
    return db.query(Photo).offset(skip).limit(limit).all()

def get_user_photos(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Photo]:
    return db.query(Photo).filter(Photo.user_id == user_id).offset(skip).limit(limit).all()

async def create_photo(db: Session, photo: PhotoCreate, file: UploadFile, user_id: int) -> Photo:
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(settings.UPLOAD_DIRECTORY, unique_filename)
    
    # Save the file
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Create and save photo record
    db_photo = Photo(
        title=photo.title,
        description=photo.description,
        file_path=file_path,
        user_id=user_id
    )
    db.add(db_photo)
    db.commit()
    db.refresh(db_photo)
    return db_photo

def update_photo(db: Session, photo_id: int, photo_update: PhotoUpdate, user_id: int) -> Optional[Photo]:
    db_photo = get_photo(db, photo_id)
    if not db_photo or db_photo.user_id != user_id:
        return None
    
    update_data = photo_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_photo, key, value)
    
    db_photo.updated_at = datetime.now()
    db.commit()
    db.refresh(db_photo)
    return db_photo

def delete_photo(db: Session, photo_id: int, user_id: int) -> bool:
    db_photo = get_photo(db, photo_id)
    if not db_photo or db_photo.user_id != user_id:
        return False
    
    # Delete the file
    if os.path.exists(db_photo.file_path):
        os.remove(db_photo.file_path)
    
    # Delete the database record
    db.delete(db_photo)
    db.commit()
    return True

def add_photo_to_album(db: Session, photo_id: int, album_id: int, user_id: int) -> Optional[Photo]:
    from app.services.album_service import get_album
    
    db_photo = get_photo(db, photo_id)
    db_album = get_album(db, album_id)
    
    if not db_photo or not db_album:
        return None
    
    if db_photo.user_id != user_id or db_album.user_id != user_id:
        return None
    
    db_photo.albums.append(db_album)
    db.commit()
    db.refresh(db_photo)
    return db_photo

def remove_photo_from_album(db: Session, photo_id: int, album_id: int, user_id: int) -> Optional[Photo]:
    from app.services.album_service import get_album
    
    db_photo = get_photo(db, photo_id)
    db_album = get_album(db, album_id)
    
    if not db_photo or not db_album:
        return None
    
    if db_photo.user_id != user_id or db_album.user_id != user_id:
        return None
    
    db_photo.albums.remove(db_album)
    db.commit()
    db.refresh(db_photo)
    return db_photo