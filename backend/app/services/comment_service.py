from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime

from app.models.comment import Comment
from app.schemas.comment import CommentCreate, CommentUpdate

def get_comment(db: Session, comment_id: int) -> Optional[Comment]:
    return db.query(Comment).filter(Comment.id == comment_id).first()

def get_photo_comments(db: Session, photo_id: int, skip: int = 0, limit: int = 100) -> List[Comment]:
    return db.query(Comment).filter(Comment.photo_id == photo_id).offset(skip).limit(limit).all()

def create_comment(db: Session, comment: CommentCreate, user_id: int) -> Comment:
    db_comment = Comment(
        text=comment.text,
        photo_id=comment.photo_id,
        user_id=user_id
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

def update_comment(db: Session, comment_id: int, comment_update: CommentUpdate, user_id: int) -> Optional[Comment]:
    db_comment = get_comment(db, comment_id)
    if not db_comment or db_comment.user_id != user_id:
        return None
    
    update_data = comment_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_comment, key, value)
    
    db_comment.updated_at = datetime.now()
    db.commit()
    db.refresh(db_comment)
    return db_comment

def delete_comment(db: Session, comment_id: int, user_id: int) -> bool:
    db_comment = get_comment(db, comment_id)
    if not db_comment or db_comment.user_id != user_id:
        return False
    
    db.delete(db_comment)
    db.commit()
    return True