from __future__ import annotations
from typing import List, Optional, Dict
from datetime import date
import pycountry

from sqlalchemy import String, Integer, ForeignKey, Table, Column, Date, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Song(db.Model):
    __tablename__ = "song"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    spotify_id: Mapped[str] = mapped_column(String, unique=True, nullable=True)
    name: Mapped[str] = mapped_column(String(128))

    artists: Mapped[List[Artist]] = relationship(secondary='credit', back_populates="songs")

    popularities: Mapped[List[SongHasPopularity]] = relationship(back_populates="song")


class Artist(db.Model):
    __tablename__ = "artist"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    spotify_id: Mapped[str] = mapped_column(String, unique=True, nullable=True)
    name: Mapped[str] = mapped_column(String(128))


    songs: Mapped[List[Song]] = relationship(secondary='credit', back_populates="artists")

    genres: Mapped[List[Genre]] = relationship(secondary='has_genre', back_populates="artists")

    popularities: Mapped[List[ArtistHasPopularity]] = relationship(back_populates="artist")


credit = Table(
    "credit",
    db.Model.metadata,
    Column("song_id", ForeignKey("song.id")),
    Column("artist_id", ForeignKey("artist.id"))
)


class Genre(db.Model):
    __tablename__ = "genre"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    name: Mapped[str] = mapped_column(String(128), unique=True)

    artists: Mapped[List[Artist]] = relationship(secondary='has_genre', back_populates="genres")

    popularities: Mapped[List[GenreHasPopularity]] = relationship(back_populates="genre")


has_genre = Table(
    "has_genre",
    db.Model.metadata,
    Column("artist_id", ForeignKey("artist.id")),
    Column("genre_id", ForeignKey("genre.id"))
)


class Country(db.Model):
    __tablename__ = "country"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String, unique=True)

    name: Mapped[str] = mapped_column(String(128), nullable=True) # for now, until we have a mapping from codes to names

    song_popularities: Mapped[List[SongHasPopularity]] = relationship(back_populates="country")
    artist_popularities: Mapped[List[ArtistHasPopularity]] = relationship(back_populates="country")
    genre_popularities: Mapped[List[GenreHasPopularity]] = relationship(back_populates="country")
#    today_popularities: Mapped[List[SongHasPopularityToday]] = relationship(back_populates="country")


class SongHasPopularity(db.Model):
    __tablename__ = "song_has_popularity"

    id: Mapped[int] = mapped_column(primary_key=True)

    song_id: Mapped[int] = mapped_column(ForeignKey("song.id"))
    country_id: Mapped[int] = mapped_column(ForeignKey("country.id"))
    date: Mapped[date] = mapped_column(Date)

    position: Mapped[int] = mapped_column(Integer)

    song: Mapped[Song] = relationship(back_populates="popularities")
    country: Mapped[Country] = relationship(back_populates="song_popularities")


#class SongHasPopularityToday(db.Model):
#    __tablename__ = "song_has_popularity_today"

#    popularity_id: Mapped[Integer] = mapped_column(ForeignKey("song_has_popularity.id"), primary_key=True)

#    popularity_entry: Mapped[SongHasPopularity] = relationship()

class ArtistHasPopularity(db.Model):
    __tablename__ = "artist_has_popularity"

    id: Mapped[int] = mapped_column(primary_key=True)

    artist_id: Mapped[int] = mapped_column(ForeignKey("artist.id"))
    country_id: Mapped[int] = mapped_column(ForeignKey("country.id"))
    date: Mapped[date] = mapped_column(Date)

    position: Mapped[int] = mapped_column(Integer)
    popularity: Mapped[int] = mapped_column(Integer, nullable=True)

    artist: Mapped[Artist] = relationship(back_populates="popularities")
    country: Mapped[Country] = relationship(back_populates="artist_popularities")


class GenreHasPopularity(db.Model):
    __tablename__ = "genre_has_popularity"

    id: Mapped[int] = mapped_column(primary_key=True)

    genre_id: Mapped[int] = mapped_column(ForeignKey("genre.id"))
    country_id: Mapped[int] = mapped_column(ForeignKey("country.id"))
    date: Mapped[date] = mapped_column(Date)

    position: Mapped[int] = mapped_column(Integer)
    popularity: Mapped[int] = mapped_column(Integer, nullable=True)

    genre: Mapped[Genre] = relationship(back_populates="popularities")
    country: Mapped[Country] = relationship(back_populates="genre_popularities")


class CountrySimilarity(db.Model):
    __tablename__ = "country_similarity"

    country1_id: Mapped[int] = mapped_column(ForeignKey("country.id"), primary_key=True)
    country2_id: Mapped[int] = mapped_column(ForeignKey("country.id"), primary_key=True)

    similarity: Mapped[float] = mapped_column(Float)

    country1: Mapped[Country] = relationship(foreign_keys=country1_id)
    
    country2: Mapped[Country] = relationship(foreign_keys=country2_id)
