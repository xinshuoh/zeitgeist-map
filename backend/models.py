from typing import List

from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from endpoint import db


class Song(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(128))

    credits: Mapped[List['Credit']] = relationship(back_populates='song')


class Artist(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(128))

    credits: Mapped[List['Credit']] = relationship(back_populates='artist')


class Credit(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    
    song_id: Mapped[int] = mapped_column(Integer, ForeignKey('song.id'))
    song: Mapped[Song] = relationship(back_populates='credits')

    artist_id: Mapped[int] = mapped_column(Integer, ForeignKey('artist.id'))
    artist: Mapped[Artist] = relationship(back_populates='credits')
