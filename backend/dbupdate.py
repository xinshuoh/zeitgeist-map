import urllib.request
from bs4 import BeautifulSoup

from flask_apscheduler import APScheduler
from flask_sqlalchemy import SQLAlchemy

from sqlalchemy import sql

from models import *

def setup(scheduler: APScheduler, db: SQLAlchemy):

    @scheduler.task('interval', id='kworb', seconds=5)
    def kworb():
        with scheduler.app.app_context():
            print(db.session.execute(sql.text("SELECT * FROM Songs")))
