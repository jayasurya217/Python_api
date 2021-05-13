# -*- coding: utf-8 -*-
"""

@author: jayas
"""


from flask import make_response, abort
from config import db
from models import Song, SongSchema


def read_all():
    """
    This function responds to a request for /api/song
    with the complete lists of song
    :return:        json string of list of song
    """
    # Create the list of song from our data
    song = Song.query.order_by(Song.id).all()

    # Serialize the data for the response
    song_schema = SongSchema(many=True)
    data = song_schema.dump(song)
    return data


def read_one(song_id):
    """
    This function responds to a request for /api/song/{song_id}
    with one matching song from data
    :param person_id:   Id of person to find
    :return:            person matching id
    """
    # Get the song requested
    song = Song.query.filter(Song.song_id == song_id).one_or_none()

    # song is there?
    if song is not None:

        # Serialize the data for the response
        song_schema = SongSchema()
        data = song_schema.dump(song)
        return data

    # Otherwise, nope, didn't find that song
    else:
        abort(
            404,
            "Person not found for Id: {person_id}".format(song_id=song_id),
        )


def create(song):
    """
    This function creates a new song in the song structure
    based on the passed in song data
    :param song:  song to create in structure
    :return:        201 on success, 406 on person exists
    """
    song_id = song.get("song_id")
    name = song.get("name")
    
    existing_song = (
        Song.query.filter(Song.id == id)
        .filter(Song.name == name)
        .one_or_none()
    )

    # Can we insert this song?
    if existing_song is None:

        # Create a song instance using the schema and the passed in song
        schema = SongSchema()
        new_song = schema.load(song, session=db.session)

        # Add the song to the database
        db.session.add(new_song)
        db.session.commit()

        # Serialize and return the newly created song in the response
        data = schema.dump(new_song)

        return data, 201

    # Otherwise, nope, song exists already
    else:
        abort(
            409,
            "song {id} {name} exists already".format(
                song_id=song_id, name=name
            ),
        )


def update(song_id, song):
    """
    This function updates an existing song in the structure
    Throws an error if a song with the name we want to update to
    already exists in the database.
    :param song_id:   Id of the song to update in the  structure
    :param song:      song to update
    :return:            updated structure
    """
    # Get the song requested from the db into session
    update_song = Song.query.filter(
        Song.song_id == song_id
    ).one_or_none()

    # Try to find an existing song with the same name as the update
    song_id = song.get("song_id")
    name = song.get("name")
    duration = song.get("duration")

    existing_song = (
        Song.query.filter(Song.song_id == song_id)
        .filter(Song.name == name)
        .one_or_none()
    )

    # Are we trying to find a song that does not exist?
    if update_song is None:
        abort(
            404,
            "Person not found for Id: {person_id}".format(song_id=song_id),
        )

    # prevent duplicate of another song already existing
    elif (
        existing_song is not None and existing_song.song_id != song_id
    ):
        abort(
            409,
            "song {song_id} {name} exists already".format(
                song_id=song_id, name=name
            ),
        )

    # Otherwise go ahead and update!
    else:

        # turn the passed in song into a db object
        schema = SongSchema()
        update = schema.load(song, session=db.session)

        # Set the id to the song we want to update
        update.song_id = update_song.song_id

        # merge the new object into the old and commit it to the db
        db.session.merge(update)
        db.session.commit()

        # return updated song in the response
        data = schema.dump(update_song)

        return data, 200


def delete(song_id):
    """
    This function deletes a song from the structure
    :param song_id:   Id of the song to delete
    :return:            200 on successful delete, 404 if not found
    """
    # Get the song requested
    song = Song.query.filter(Song.song_id == song_id).one_or_none()

    # Did we find a song?
    if song is not None:
        db.session.delete(song)
        db.session.commit()
        return make_response(
            "Person {song_id} deleted".format(song_id=song_id), 200
        )

    # Otherwise, nope, didn't find that song
    else:
        abort(
            404,
            "Person not found for Id: {song_id}".format(song_id=song_id),
        )