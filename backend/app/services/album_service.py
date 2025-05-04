from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc, asc
from typing import Optional, List
from datetime import datetime

from app.models.album import Album
from app.schemas.album import AlbumCreate, AlbumUpdate, AlbumSearchParams

def get_album(db: Session, album_id: int) -> Optional[Album]:
    return db.query(Album).filter(Album.id == album_id).first()

def get_albums(db: Session, skip: int = 0, limit: int = 100) -> List[Album]:
    return db.query(Album).offset(skip).limit(limit).all()

def get_user_albums(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Album]:
    return db.query(Album).filter(Album.user_id == user_id).offset(skip).limit(limit).all()

def create_album(db: Session, album: AlbumCreate, user_id: int) -> Album:
    db_album = Album(
        title=album.title,
        description=album.description,
        is_private=album.is_private,
        user_id=user_id
    )
    db.add(db_album)
    db.commit()
    db.refresh(db_album)
    return db_album

def update_album(db: Session, album_id: int, album_update: AlbumUpdate, user_id: int) -> Optional[Album]:
    db_album = get_album(db, album_id)
    if not db_album or db_album.user_id != user_id:
        return None
    
    update_data = album_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_album, key, value)
    
    db_album.updated_at = datetime.now()
    db.commit()
    db.refresh(db_album)
    return db_album

def delete_album(db: Session, album_id: int, user_id: int) -> bool:
    db_album = get_album(db, album_id)
    if not db_album or db_album.user_id != user_id:
        return False
    
    db.delete(db_album)
    db.commit()
    return True

def search_albums(
    db: Session, 
    params: AlbumSearchParams, 
    current_user_id: Optional[int] = None,
    skip: int = 0, 
    limit: int = 100
) -> List[Album]:
    query = db.query(Album)
    filters = []
    if params.title:
        filters.append(Album.title.ilike(f"%{params.title}%"))
    if params.user_id:
        filters.append(Album.user_id == params.user_id)
    if params.is_private is not None:
        if params.is_private:
            filters.append(and_(Album.is_private == True, Album.user_id == current_user_id))
        else:
            filters.append(Album.is_private == False)
    else:
        privacy_filter = or_(
            Album.is_private == False,
            and_(Album.is_private == True, Album.user_id == current_user_id) if current_user_id else False
        )
        filters.append(privacy_filter)
    if params.created_after:
        filters.append(Album.created_at >= params.created_after)
    if params.created_before:
        filters.append(Album.created_at <= params.created_before)
    if filters:
        query = query.filter(*filters)
    if params.sort_by == "title":
        ordering = Album.title.asc() if params.sort_order == "asc" else Album.title.desc()
    else:
        ordering = Album.created_at.asc() if params.sort_order == "asc" else Album.created_at.desc()
    query = query.order_by(ordering)
    query = query.offset(skip).limit(limit)
    return query.all()

def check_album_access(db: Session, album_id: int, user_id: Optional[int]) -> bool:
    album = get_album(db, album_id)
    if not album:
        return False
    
    return not album.is_private or album.user_id == user_id
