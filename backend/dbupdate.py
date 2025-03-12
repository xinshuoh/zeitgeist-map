import urllib.request
from bs4 import BeautifulSoup

from flask_apscheduler import APScheduler
from flask_sqlalchemy import SQLAlchemy

from sqlalchemy import insert

import datetime as dt

from models import *

from daily_scrape import DailyScraper

def setup(scheduler: APScheduler, db: SQLAlchemy):
    @scheduler.task('interval', id='daily_scrape', days=1)
    def daily_scrape():
        print("Scraping...")
        with scheduler.app.app_context():
            daily_scraper = DailyScraper(db)
            daily_scraper.scrape()
