from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Any

from app.dependencies import get_db, get_current_user
from app.services.photo_service import (
    get_photo,
    get_photos,
    get_user_photos,
    create_photo,
    update_photo,
    delete_photo,
    add_photo_to_album,
    remove_photo_from_album,
)
from app.schemas.photo import Photo, PhotoCreate, PhotoUpdate, PhotoWithDetails
from app.schemas.user import User

router = APIRouter()

@router.get("", response_model=List[Photo])
def read_photos(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    photos = get_photos(db, skip=skip, limit=limit)
    return photos

@router.get("/my", response_model=List[Photo])
def read_my_photos(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    photos = get_user_photos(db, user_id=current_user.id, skip=skip, limit=limit)
    return photos

@router.post("", response_model=Photo, status_code=status.HTTP_201_CREATED)
async def upload_photo(
    title: str = Form(...),
    description: str = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    photo_in = PhotoCreate(title=title, description=description)
    photo = await create_photo(db, photo_in, file, current_user.id)
    return photo

@router.get("/{photo_id}", response_model=PhotoWithDetails)
def read_photo(
    photo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    photo = get_photo(db, photo_id=photo_id)
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found",
        )
    return photo

@router.put("/{photo_id}", response_model=Photo)
def update_photo_endpoint(
    photo_id: int,
    photo_in: PhotoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    photo = update_photo(db, photo_id, photo_in, current_user.id)
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found or you don't have permission to update it",
        )
    return photo

@router.delete("/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_photo_endpoint(
    photo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    success = delete_photo(db, photo_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found or you don't have permission to delete it",
        )

@router.post("/{photo_id}/albums/{album_id}", response_model=Photo)
def add_photo_to_album_endpoint(
    photo_id: int,
    album_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    photo = add_photo_to_album(db, photo_id, album_id, current_user.id)
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo or album not found or you don't have permission",
        )
    return photo

@router.delete("/{photo_id}/albums/{album_id}", response_model=Photo)
def remove_photo_from_album_endpoint(
    photo_id: int,
    album_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    photo = remove_photo_from_album(db, photo_id, album_id, current_user.id)
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo or album not found or you don't have permission",
        )
    return photo