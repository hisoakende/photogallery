from pydantic import BaseModel, ConfigDict
from typing import Optional, ForwardRef
from datetime import datetime

# Используем ForwardRef для решения проблемы циклических импортов
User = ForwardRef('User')

class CommentBase(BaseModel):
    text: str

class CommentCreate(CommentBase):
    photo_id: int

class CommentUpdate(BaseModel):
    text: Optional[str] = None

class CommentInDBBase(CommentBase):
    id: int
    user_id: int
    photo_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

class Comment(CommentInDBBase):
    pass

class CommentWithUser(Comment):
    user: User

# Обновляем ForwardRef после объявления
from app.schemas.user import User
CommentWithUser.model_rebuild()
