# -*- coding: utf-8 -*-
"""

@author: jayas
"""


import os
from config import db
from models import Song

# Data to initialize database with
song = [
    {"id": "1", "Name": "shape_of_you", "Duration":"300"},
    {"id": "2", "Name": "Love_me_like_you_do", "Duration":"360"},
    {"id": "3", "Name": "Animals", "Duration":"370"},
]

# Delete database file if it exists currently
if os.path.exists("song.db"):
    os.remove("song.db")

# Create the database
db.create_all()

# iterate over the PEOPLE structure and populate the database
for name in song:
    p = Song(name.get("id"), fname=name.get("fname"))
    db.session.add(p)

db.session.commit()