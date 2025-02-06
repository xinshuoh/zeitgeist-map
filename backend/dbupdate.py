from threading import Thread
from time import sleep

class DBUpdate(Thread):
    def __init__(self):
        Thread.__init__(self)

    def run(self):
        while True:
            sleep(10)
            print("Updating database....")