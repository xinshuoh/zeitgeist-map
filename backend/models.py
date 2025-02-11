from __future__ import annotations
from typing import List, Optional, Dict
from datetime import date

from sqlalchemy import String, Integer, ForeignKey, Table, Column, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Song(db.Model):
    __tablename__ = "song"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(128))

    artists: Mapped[List[Artist]] = relationship(secondary='credit', back_populates="songs")
    popularities: Mapped[List[SongHasPopularity]] = relationship(back_populates="song")


class Artist(db.Model):
    __tablename__ = "artist"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(128))

    songs: Mapped[List[Song]] = relationship(secondary='credit', back_populates="artists")

    genres: Mapped[List[Genre]] = relationship(secondary='has_genre', back_populates="artists")


credit = Table(
    "credit",
    db.Model.metadata,
    Column("song_id", ForeignKey("song.id")),
    Column("artist_id", ForeignKey("artist.id"))
)


class Genre(db.Model):
    __tablename__ = "genre"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    
    name: Mapped[str] = mapped_column(String(128))

    artists: Mapped[List[Artist]] = relationship(secondary='has_genre', back_populates="genres")


has_genre = Table(
    "has_genre",
    db.Model.metadata,
    Column("artist_id", ForeignKey("artist.id")),
    Column("genre_id", ForeignKey("genre.id"))
)

class Country(db.Model):
    __tablename__ = "country"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    name: Mapped[str] = mapped_column(String(128))

    popularities: Mapped[List[SongHasPopularity]] = relationship(back_populates="country")


class SongHasPopularity(db.Model):
    __tablename__ = "song_has_popularity"

    song_id: Mapped[int] = mapped_column(ForeignKey("song.id"), primary_key=True)
    country_id: Mapped[int] = mapped_column(ForeignKey("country.id"), primary_key=True)
    date: Mapped[date] = mapped_column(Date, primary_key=True)

    position: Mapped[int] = mapped_column(Integer)


    song: Mapped[Song] = relationship(back_populates="popularities")
    country: Mapped[Country] = relationship(back_populates="popularities")

