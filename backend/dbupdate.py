def setup(scheduler):
    @scheduler.task('interval', id='job_1', seconds=5)
    def job1():
        # print("Test")
        pass