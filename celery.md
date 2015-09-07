
Installation
-----------
```
source: https://realpython.com/blog/python/asynchronous-tasks-with-django-and-celery/

$ pip install -r requirements.txt
$ brew install redis

# start redis
$ redis-server

# test redis
$ redis-cli ping

# test celery
$ celery -A myproj beat -l info 

# settings.py ##############################################
# CELERY STUFF
BROKER_URL = 'redis://redis:6379'
CELERY_RESULT_BACKEND = 'redis://redis:6379'
CELERY_ACCEPT_CONTENT = ['application/json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'America/Chicago'


#CELERY CRONTAB DOCS:
http://celery.readthedocs.org/en/latest/userguide/periodic-tasks.html#crontab-schedules


```

Usage
-----
```python

# /myproj/celery.py ##############################################
from __future__ import absolute_import
import os
from celery import Celery
from django.conf import settings

# set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproj.settings')
app = Celery('myproj')

# Using a string here means the worker will not have to
# pickle the object when using Windows.
app.config_from_object('django.conf:settings')
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)


@app.task(bind=True)
def debug_task(self):
    print('Request: {0!r}'.format(self.request))


# myapp/tasks.py ##############################################
from celery.task.schedules import crontab
from celery.decorators import periodic_task

@periodic_task(run_every=(crontab()), name="some_task", ignore_result=False)
def some_task():
    print('hello world')

# NOTE: In production, you will want to run thes command on supervisor.
# See here for supervisor setup instructions:
# https://realpython.com/blog/python/asynchronous-tasks-with-django-and-celery/

# run periodic tasks
$ cd myproj
$ celery -A myproj beat -l info 
or
$ celery -A myproj -B -l info


# run normal task
$ celery -A myproj worker -l info 



```
