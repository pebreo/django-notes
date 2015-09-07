common imports
-------------
```

from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, redirect, get_object_or_404
from django.core.urlresolvers import reverse
from django.http import Http404

from django.contrib.auth.decorators import login_required # @login_required(login_url='/login')

from django.contrib.auth import authenticate, login, logout
from django.utils.safestring import mark_safe
from django.contrib import messages

# exceptions
from django.db import IntegrityError
from django.exceptions import ObjectDoesNotExist, PermissionDenied
# MyModel.DoesNotExist

from apps.videos.models import Video

def index(request):
    """ Home page view for chipy """
    try:
        meeting = Meeting.objects.latest('when')
        num_rsvped = Person.objects.filter(ynm='Y').count()
    except (KeyError, Meeting.DoesNotExist, Person.DoesNotExist):
        raise Http404

    return render(request,'wordcount/login.html')
```

dumpdata and loaddata
--------------
```python
# dumpdata for specific app
./manage.py dumpdata myapp > /tmp/myapp.json

# dumpdata for a specific table 
./manage.py dumpdata admin.logentry > /tmp/logentry.json

# loaddata basic
./manage.py loaddata /tmp/user.json

# restore fresh database
./manage.py dumpdata --exclude auth.permission --exclude contenttypes > /tmp/db.json
./manage.py loaddata /tmp/db.json
```


Static configuration
--------------------
```python
import os
STATIC_ROOT - target directory for collectstatic
STATICFILES_DIRS - additional locations that collectstatic and findstatic will traverse
MEDIA_ROOT - directory that contains user uploaded files

STATIC_URL = '/static/'
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(HTDOCS_ROOT,  'media')
STATIC_ROOT = os.path.join(HTDOCS_ROOT,  'static')

STATICFILES_DIRS = (
    os.path.join(PROJECT_ROOT, 'static'),
)
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
    'django.contrib.staticfiles.finders.DefaultStorageFinder',
    #'compressor.finders.CompressorFinder',
)
===
BASE_DIR = dirname(dirname(__file__))

APPS_PATH = join(BASE_DIR, 'apps')

current working directory
print os.path.dirname(os.path.realpath(__file__))
```

URL bootstrap
---------------
```python
from django.conf.urls import patterns, include, url 
from django.shortcuts import redirect 
from django.core.urlresolvers import reverse

from django.views.generic.base import RedirectView 
from django.views.generic import TemplateView

from django.contrib import admin
admin.autodiscover()

from accounts.views import MyView

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'lulu.views.home', name='home'),
    # url(r'^reputationconsole/', include('lulu.foo.urls')),
    url(
        r'^admin/doc/', 
        include('django.contrib.admindocs.urls')
    ),
    url(
        r'^admin/', 
        include(admin.site.urls)
    ),
    url(
        r'^api-auth/', 
        include('rest_framework.urls', 
        namespace='rest_framework')
    ),
    url(
        r'^api/v1/', 
        include('myapi.urls')
    ),          
    url(
        r'^accounts/', 
        include('userena.urls')
    ),
    url(
        r'^faq/?', 
        include('faq.urls')
    ),

    url(
        r'^reportingcenter/', 
        include('reportingcenter.urls')
    ),
    url(
        r'^unsubscribe/(?P<unsubscribe_key>[a-zA-Z0-9].*)/?$',
        UnsubscribeView.as_view(),
        name="Email Unsubscribe"
    ),
    url(
        r'^', 
        include('app.urls')
    ),    

)

# app/urls.py
from django.conf.urls import *
from myapp.views import IndexView

urlpatterns = patterns('',
    url(r'^$', view=IndexView.as_view(), name="myapp_index"),
    url(r'^signup/', RedirectView.as_view(url='/accounts/signup')),
)

#convert URL to new type
http://stackoverflow.com/questions/14882491/django-release-1-5-url-requires-a-non-empty-first-argument-the-syntax-change/15373978#15373978

command:
find . -type f -print0 | xargs -0 sed -i 's/{% url \([^" >][^ >]*\)/{% url "\1"/g'
```

Template example
-------
```html

{% extends "base.html" %}

{% block stylesheets %}
{{ block.super }}
<link rel="stylesheet" href="{{ STATIC_URL }}css/smoothness/jquery-ui-1.8.20.custom.css" />
<link type="text/css" rel="stylesheet" href="{{ STATIC_URL }}css/slickgrid/slick.grid.css">
<link type="text/css" rel="stylesheet" href="{{ STATIC_URL }}css/grid.css">
{% endblock %}

{% incled 'navbar.html' %}

{% block content %}

{% if request.user.is_superuser %}
    {{ blah }}
{% endif %}

<ul>
    {% for publisher in object_list %}
    <li>{{ publisher.name }}</li>
    {% endfor %}
</ul>

{% endblock %}

```
Django manage.py
------------
```bash
django-admin.py startproject
./manage.py startapp
./manage.py dbshell

./manage.py runserver 0.0.0.0:8000

# dbshell commands - postgres
> \dt # show tables
> drop table mytable; # delete table
> truncate mytable; # clear table
> select * from mytable limit 100;
> \q # quit

# dbshell commands - sqlite
> .tables  # show tables
> .q   # exit
```

Django manage.py
------------
```bash
django-admin.py startproject
./manage.py startapp
./manage.py dbshell

./manage.py inspectdb > models.py # create models based on an existing table

./manage.py runserver 0.0.0.0:8000

# dbshell commands - postgres
> \dt # show tables
> drop table mytable; # delete table
> truncate mytable; # clear table
> select * from mytable limit 100;
> \q # quit

# dbshell commands - sqlite
> .tables  # show tables
> .q   # exit
```

Running tests
-----
```bash
./manage.py test # test all
./manage.py test myapp # test app

# test specific test
./manage.py test myapp.tests.MyTest.test_something

```


Django populate script 
---------------------
```python
# source: https://github.com/danielveazey/rango/blob/master/populate_rango.py

__author__ = 'daniel'

import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tango_with_django_project.settings')

import django
django.setup()

from rango.models import Category, Page


def populate():
    python_cat = add_cat('Python', 128, 64)

    add_page(cat=python_cat,
             title="Official Python Tutorial",
             url="http://docs.python.org/2/tutorial/",
             views=15)
             
    # print additions for user
    for c in Category.objects.all():
        for p in Page.objects.filter(category=c):
            print "- {0} - {1}".format(str(c), str(p))


def add_page(cat, title, url, views):
    p = Page.objects.get_or_create(category=cat, title=title)[0]
    p.url=url
    p.views=views
    p.save()
    return p


def add_cat(name, views, likes):
    c = Category.objects.get_or_create(name=name)[0]
    c.views = views
    c.likes = likes
    c.save()
    return c


# start execution here
if __name__ == '__main__':
    print "Starting Rango population script ..."
    populate()
```


JMeter
--------------
```
Search : jmeter download and download the tgz

Note: thread=users
1.
Right click "Test Plan" -> add Thread Group

Number of threads: 10 # number of clients
Ramp-up period: 0   # all clients start at same time
Loop count: 100    # number of requests per client

2.
Right click on Thread Group -> Config Element -> Http Request Defaults

Server Name or IP: localhost (or 192.168.23.11)
Port: 8000 # or whatever it should be

3. Right click on Thread Group -> Sampler -> Http Request
specify path: /

4. Right click on Thread Group -> Listener -> View Results Tree
  Right click on Thread group -> Listener -> Aggregate report
  
5. While Aggregate report is selected: Click Play icon on the top

Analysis
Throughput:
Throughput => number of requests per second your server can handle
Reponse time:
90% percentile => number of milliseconds it can respond

Note: if you want to test new results you should remove and re-add the Listeners
```


Useful utilities
---------------

Django-compressor
--------------
Compresses linked and inline JavaScript or CSS into a single cached file.
```html
//Example

{% load compress %}
{% compress css %}
<link rel="stylesheet" href="/static/css/one.css" type="text/css" charset="utf-8">
<style type="text/css">p { border:5px solid green;}</style>
<link rel="stylesheet" href="/static/css/two.css" type="text/css" charset="utf-8">
{% endcompress %}
```

Misc
```python
   def get_queryset(self):
        entries = []

        for date in Entry.objects.values_list('created__date', flat=True):
            entries.extend(
                Entry.objects.filter(created__date=date).order_by('created')[:N]
            )

        return entries
```

Angular - Common directives
----------------------------
```html

# ng-if 
// Show if the condition is true
<div class="alert" ng-if="myvar"></div>

# ng-hide ; ng-show
<div ng-hide="foo == bar"></div>

# ng-class
ng-class="{'myclass': foo.bar > x}"

# ng-repeat

<ul>
  <li ng-repeat="rule in rules">
  {{ rule.rulename }}
  </li>
</ul>

# ng-click

<input type="button" ng-click="myAlert()"/>

$scope.$watch('mymodel', function() {
    // do something when mymodel changes
});
```

Angular promises and $q
------------------------
```javascript

# in the service
var defer = $q.defer()
    defer.resolve(myData);
    
    defer.reject('my reason');
return defer.promised;

# in the controller
myService
.then(handleSuccess)
.catch(handleFailure)


# For $http
# in the myAPIService

// A SIMPLE EXAMPLE ON USING q OBJECT TO MAKE PROMISES
/// AND STORING DATA IN THESO PROMISES
app.factory("myService", [ "$http", "$q" ,function($http, $q){

    var deferred = $q.defer();

    $http.get('/my/api/point', {

        success: function(data) {
            // optional
            deferred.resolve(data);
        },
        fail: function(message) {
            // optional
            deferred.fail(message); //?
        },

    });

    return deferred.promise;

}]);

// USAGE
app.controller("MyCtrl"["myService", function(myService){

    myService.myFunc
        .then(handleSuccess)
        .catch(handleFail)

    function handleSuccess(data) {

        $scope.data = data;
    };

    function handleFail(message) {
        console.log(message);
    };

}]);

```

logging
-------
```
import logging
import requests
logger = logging.getLogger(__name__)
def get_additional_data():
    try:
        r = requests.get('http://exampl.com/something')
    except requests.HTTPError as e:
        logger.exception(e)
        logger.debug('Could not get additional data', exc_info=True)
        return None
    return r
```


Django+IPython Notebook
-------------
```
pip install "ipython[all]"
pip install django-extensions==1.5.6
add "django_extensions" to INSTALLED_APPS

# create ipython_config.py next to manage.py file and it should have the following contents:
###################################################
c = get_config()

# Allow all IP addresses to use the service and run it on port 80.
c.NotebookApp.ip = '0.0.0.0'
c.NotebookApp.port = 80

# Don't load the browser on startup.
c.NotebookApp.open_browser = False
###################################################


# run this command
./manage.py shell_plus --notebook

# finally, click New-> Django-Shell Plus
```
