from pydantic import BaseModel, ConfigDict
from typing import Optional, List, ForwardRef
from datetime import datetime

# Используем ForwardRef для решения проблемы циклических импортов
Photo = ForwardRef('Photo')
User = ForwardRef('User')

class AlbumBase(BaseModel):
    title: str
    description: Optional[str] = None
    is_private: bool = False  # Добавляем поле приватности с дефолтным значением

class AlbumCreate(AlbumBase):
    pass

class AlbumUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_private: Optional[bool] = None  # Возможность обновления статуса приватности

class AlbumInDBBase(AlbumBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

class Album(AlbumInDBBase):
    # photos: List[Photo] = []
    pass

class AlbumWithPhotos(Album):
    owner: User
    photos: List[Photo] = []

# Добавим новую схему для параметров поиска/фильтрации
class AlbumSearchParams(BaseModel):
    title: Optional[str] = None
    user_id: Optional[int] = None
    is_private: Optional[bool] = None
    created_after: Optional[datetime] = None
    created_before: Optional[datetime] = None
    sort_by: Optional[str] = "created_at"  # Варианты: created_at, title
    sort_order: Optional[str] = "desc"     # Варианты: asc, desc

# Обновляем ForwardRef после объявления
from app.schemas.photo import Photo
from app.schemas.user import User
AlbumWithPhotos.model_rebuild()
