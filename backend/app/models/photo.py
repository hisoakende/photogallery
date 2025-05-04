from sqlalchemy import Column, ForeignKey, Integer, String, DateTime, Text, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base

photo_album = Table(
    "photo_album",
    Base.metadata,
    Column("photo_id", Integer, ForeignKey("photos.id"), primary_key=True),
    Column("album_id", Integer, ForeignKey("albums.id"), primary_key=True)
)

class Photo(Base):
    __tablename__ = "photos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text, nullable=True)
    file_path = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="photos")
    albums = relationship("Album", secondary=photo_album, back_populates="photos")
    comments = relationship("Comment", back_populates="photo", cascade="all, delete-orphan")
