from pydantic import BaseModel, ConfigDict
from typing import Optional, List, ForwardRef, Annotated
from datetime import datetime

# Используем ForwardRef для решения проблемы циклических импортов
User = ForwardRef('User')
Comment = ForwardRef('Comment')

class PhotoBase(BaseModel):
    title: str
    description: Optional[str] = None

class PhotoCreate(PhotoBase):
    pass

class PhotoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

class PhotoInDBBase(PhotoBase):
    id: int
    file_path: str
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

class Photo(PhotoInDBBase):
    pass

class PhotoWithDetails(Photo):
    owner: User
    comments: List[Comment] = []

# Обновляем ForwardRef после объявления
from app.schemas.user import User
from app.schemas.comment import Comment
PhotoWithDetails.model_rebuild()
