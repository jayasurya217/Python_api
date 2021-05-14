# -*- coding: utf-8 -*-
"""

@author: jayas
"""


from datetime import datetime
from config import db, ma
from marshmallow_sqlalchemy import ModelSchema

class Song(db.Model):
    __tablename__ = "song"
    song_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    duration = db.Column(db.Integer)
    upload_time = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class SongSchema(ModelSchema):
    class Meta:
        model = Song
        sqla_session = db.session
