from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Any, Optional
from datetime import datetime

from app.dependencies import get_db, get_current_user
from app.services.album_service import (
    get_album,
    get_albums,
    get_user_albums,
    create_album,
    update_album,
    delete_album,
    search_albums,
    check_album_access
)
from app.schemas.album import Album, AlbumCreate, AlbumUpdate, AlbumWithPhotos, AlbumSearchParams
from app.schemas.user import User

router = APIRouter()

@router.get("", response_model=List[AlbumWithPhotos])
def read_albums(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    params = AlbumSearchParams()
    albums = search_albums(db, params, current_user.id, skip, limit)
    return albums

@router.get("/my", response_model=List[AlbumWithPhotos])
def read_my_albums(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    albums = get_user_albums(db, user_id=current_user.id, skip=skip, limit=limit)
    return albums

@router.post("", response_model=Album, status_code=status.HTTP_201_CREATED)
def create_album_endpoint(
    album_in: AlbumCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    album = create_album(db, album_in, current_user.id)
    return album

@router.get("/{album_id}", response_model=AlbumWithPhotos)
def read_album(
    album_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
) -> Any:
    album = get_album(db, album_id=album_id)
    if not album:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Album not found",
        )
    user_id = current_user.id if current_user else None
    if album.is_private and album.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this album",
        )
    
    return album

@router.put("/{album_id}", response_model=Album)
def update_album_endpoint(
    album_id: int,
    album_in: AlbumUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    album = update_album(db, album_id, album_in, current_user.id)
    if not album:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Album not found or you don't have permission to update it",
        )
    return album

@router.delete("/{album_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_album_endpoint(
    album_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    success = delete_album(db, album_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Album not found or you don't have permission to delete it",
        )
    return None

@router.get("/search/", response_model=List[Album])
def search_albums_endpoint(
    title: Optional[str] = Query(None, description="Search by album title"),
    user_id: Optional[int] = Query(None, description="Filter by user ID"),
    is_private: Optional[bool] = Query(None, description="Filter by privacy status"),
    created_after: Optional[datetime] = Query(None, description="Filter albums created after this date"),
    created_before: Optional[datetime] = Query(None, description="Filter albums created before this date"),
    sort_by: Optional[str] = Query("created_at", description="Sort field (created_at or title)"),
    sort_order: Optional[str] = Query("desc", description="Sort order (asc or desc)"),
    skip: int = Query(0, description="Skip N records"),
    limit: int = Query(100, description="Limit to N records"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
) -> Any:
    params = AlbumSearchParams(
        title=title,
        user_id=user_id,
        is_private=is_private,
        created_after=created_after,
        created_before=created_before,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    user_id = current_user.id if current_user else None
    albums = search_albums(db, params, user_id, skip, limit)
    return albums
