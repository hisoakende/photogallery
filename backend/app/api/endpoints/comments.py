from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Any

from app.dependencies import get_db, get_current_user
from app.services.comment_service import (
    get_comment,
    get_photo_comments,
    create_comment,
    update_comment,
    delete_comment,
)
from app.schemas.comment import Comment, CommentCreate, CommentUpdate, CommentWithUser
from app.schemas.user import User

router = APIRouter()

@router.get("/photo/{photo_id}", response_model=List[CommentWithUser])
def read_photo_comments(
    photo_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    comments = get_photo_comments(db, photo_id=photo_id, skip=skip, limit=limit)
    return comments

@router.post("", response_model=Comment, status_code=status.HTTP_201_CREATED)
def create_comment_endpoint(
    comment_in: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    comment = create_comment(db, comment_in, current_user.id)
    return comment

@router.put("/{comment_id}", response_model=Comment)
def update_comment_endpoint(
    comment_id: int,
    comment_in: CommentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    comment = update_comment(db, comment_id, comment_in, current_user.id)
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found or you don't have permission to update it",
        )
    return comment

@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment_endpoint(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    success = delete_comment(db, comment_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found or you don't have permission to delete it",
        )
