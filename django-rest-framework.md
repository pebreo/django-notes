Quick of Example of RESTful transactions
----------------------------------------
The point of REST is to have a standard practice for
doing CRUD transactions. Here are typical REST transactions:
* POST request to /api/articles with hdata payload to create new Article instance. 
* PATCH request to /api/articles/1/ to partially update Article with pk of 1..save 
* PUT request to /api/articles/1/ to completely replace Article with pk of 1. 
* DELETE request to /api/articles/1/ to delete Article with pk of 1. 
* GET request to /api/articles/1/ to retrieve Article with pk of 1. 
* HEAD request to /api/articles/1/ to see if Article with pk of exists.

Checklist
--------
In order to install Django REST Framework in your project you need to make 
changes to:
* `requirements.txt`
* `settings.py`
* `models.py`
* `serializers.py`
* `views.py`
* `urls.py`

Installation
------------
```
pip install djangorestframework==3.1.3
pip install markdown
pip install django-filter

# settings.py
INSTALLED_APPS = (
    'rest_framework', 
)

# this is optional
# Use Django's standard `django.contrib.auth` permissions,
# or allow read-only access for unauthenticated users.
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.DjangoModelPermissionsOrAnonReadOnly'
    ]
}


# urls.py - default setup
urlpatterns = [
    # will automatically take you to login
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework'))
]

# usage: mysite.com/entries

```


Development / Using Browsable API
--------------------------
```

./manage.py runserver 0.0.0.0:8001

browse: mysite.com/entries/1

```


models.py
---------
```python

from django.db import models
from django.contrib import admin
import datetime
import pytz
from django.utils.timezone import make_aware

# Entry
class Entry(models.Model):
    entry = models.TextField()

    goal_words = models.IntegerField(default=200)
    achieved_goal = models.BooleanField(default=False)

    publish = models.BooleanField(default=True)
    created = models.DateTimeField(blank=True, null=True)
    
    def save(self, *args, **kwargs):
        '''
        override save so that i can edited created datetime
        also, this will autosave the datetime.
        '''
        if not self.id:
            self.created = make_aware(datetime.datetime.now(), timezone=pytz.timezone('America/Chicago'))
        return super(Entry, self).save(*args, **kwargs)

    class Meta:
        verbose_name_plural = "entries"

class EntryAdmin(admin.ModelAdmin):
    list_display = ('created',)

admin.site.register(Entry, EntryAdmin)

```


serializers.py
--------------
```python

from journal.models import Entry
from rest_framework import serializers


class EntrySerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Entry
        fields = ('pk','entry', 'goal_words', 'achieved_goal','created')

```


views.py
--------
```python

import logging
import sys
logging.basicConfig(stream=sys.stdout, level=logging.DEBUG)

from django.http import Http404 
from django.shortcuts import render_to_response, HttpResponse, HttpResponseRedirect, RequestContext 
from django.shortcuts import render, get_object_or_404 
from django.views import generic 
from django.core.urlresolvers import reverse 
from django.contrib.auth import authenticate, login
from django.views.generic import ListView, DetailView, TemplateView

from journal.models import Entry
from journal.serializers import EntrySerializer
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, mixins, status

from datetime import datetime
from itertools import groupby

from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse
from rest_framework import pagination

class LargeResultsSetPagination(pagination.PageNumberPagination):
    page_size = None
    #page_size_query_param = 'page_size'
    #max_page_size = 10000
    

class EntryList(generics.ListCreateAPIView):
    #queryset = Entry.objects.all()
    serializer_class = EntrySerializer
    pagination_class = LargeResultsSetPagination

    def post(self, request, format=None):
        serializer = EntrySerializer(data=request.data)
        if serializer.is_valid():
            # Entry.objects.create(
            #                 entry=serializer.validated_data['entry'],
            #                 goal_words=serializer.validated_data['goal_words'],
            #                 achieved_goal=serializer.validated_data['achieved_goal'],
            #                 created=datetime.now())
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
   
    def get_queryset(self):
        ''' 
        get the last entry for a the given days
        '''
        entries = []
        for key, entries_for_a_day in groupby(Entry.objects.order_by('created'), lambda x: x.created):
            last_entry_for_day = sorted(entries_for_a_day, key=lambda x: x.created, reverse=True)[0]
            entries.append(last_entry_for_day)
        return entries

class EntryDetail(mixins.RetrieveModelMixin,
                    mixins.UpdateModelMixin,
                    mixins.DestroyModelMixin,
                    generics.GenericAPIView):
    queryset = Entry.objects.all()
    serializer_class = EntrySerializer

    # def get(self, request, pk, format=None):
    #     entry = self.get_object(pk)
    #     serializer = SnippetSerializer(entry)
    #     return Response(serializer.data)

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)

```

FUNCTIONAL VIEWS FOR REST API (MISSING IMPORTS)
----------------------------------------------
```python
# prompt/urls.py
from django.conf.urls import url
import .views

urlpatterns = [
    url(r'snippets/$', views.snippet_list),
    url(r'snippets/(?P<pk>[0-9]+)/$', views.snippet_detail),
]

# models.py
class Snippet(models.Model):
    owner = models.ForeignKey('auth.User', related_name='prompts', on_delete=models.CASCADE)
    title = models.CharField(max_length=100, blank=True, default='')
    code = models.TextField()


# serializers.py
class SnippetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Snippet
        fields = ('id','owner','title','code')

from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Snippet
from .serializers import SnippetSerializer

from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser

# views.py
class JSONResponse(HttpResponse):
    def __init__(self, data, **kwargs):
        content = JSONRenderer().render(data)
        kwargs['content_type'] = 'application/json'
        super(JSONResponse, self).__init__(content, **kwargs)

# normally would not do this
# /snippets
@csrf_exempt
def snippet_list(request):
    if request.method = 'GET':
        snippets = Snippet.objects.all()
        serializer = SnippetSerializer(snippets, many=True)
        return JSONResponse(serializer.data)
    if request.method = 'POST':
        data = JSONParser().parse(request)
        serializer = SnippetSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return JSONResponse(serializer.data, status=201)
        return JSONResponse(serializer.errors, status=400)

# /snippets/1
@csrf_exempt
def snippet_detail(request, pk):
    try:
        snippet = Snippet.object.get(pk=pk)
    except Snippet.DoesNotExist:
        return HttpResponse(status=404)
    
    if request.method = 'GET':
        serializer = SnippetSerializer(snippet)
        return JSONResponse(serializer.data)
    
    if request.method = 'PUT':
        data = JSONParser().parse(request)
        serializer = SnippetSerializer(snippet, data=data)
        if serializer.is_valid():
            serializer.save()
            return JSONResponse(serializer.data)
        return JSONResponse(serializer.errors, status=400)

    if request.method = 'DELETE':
        snippet.delete()
        return HttpResponse(status=204)


```


FULL EXAMPLE USING DJ REST VIEWSETS
-----------------------------------
ViewSets makes it easier to use `ModelViews`, `ModelSerializers`
and the `/api/mymodel` convention for your REST API.

This example using DJRest `ViewSets`
and the api url has been customized in `urls.py`
using `router.register()` command (see below)

```python
# prompt/apps.py
# you need an app.py in Django 1.9+
from django.apps import AppConfig

class PromptConfig(AppConfig):
    name = 'prompt'
    verbose_name = "Prompt App"

# settings.py
INSTALL_APPS = (
    'prompt',
    ..
)

# urls.py
from django.contrib import admin
from prompt import views as prompt_views
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'prompts', prompt_views.EntryViewSet)
# /api/prompts

from django.conf.urls import include, url
from django.contrib import admin
from django.views.generic import TemplateView

from home import views as home_views

urlpatterns = [
    url(r'^1adminn333/', include(admin.site.urls)),
    url(r'^app', TemplateView.as_view(template_name="apps/prompt/index.html"), name='index'),
    url(r'^zapp', TemplateView.as_view(template_name="apps/home/index.html"), name='index'),  
    #url(r'^', include('todo.urls')),

    # home
    url(r'^$', home_views.home, name='home'), 
    #url(r'^', include('home.urls')),
    
    # /api/prompts
    url(r'^api/', include(router.urls)),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework'))
]


# models.py
from django.db import models
from django.contrib import admin
from django.contrib.postgres.fields import JSONField
import datetime
# Create your models here.
import pytz
from django.utils.timezone import make_aware

# Entry
class Entry(models.Model):
    owner = models.ForeignKey('auth.User', related_name='prompts', on_delete=models.CASCADE)
    title = models.CharField('title', max_length=64)
    # django 1.9+ only!!!
    # you could download django-jsonfield package though for <= django 1.8
    prompt = JSONField()
    created = models.DateTimeField(blank=True, null=True)

    def save(self, *args, **kwargs):
        '''
        override save so that i can edited created datetime
        also, this will autosave the datetime.
        '''
        if not self.id:
            self.created = make_aware(datetime.datetime.now(), timezone=pytz.timezone('America/Chicago'))
        return super(Entry, self).save(*args, **kwargs)
    class Meta:
        verbose_name_plural = "entries"

class EntryAdmin(admin.ModelAdmin):
    list_display = ('created',)
    def save_model(self, request, obj, form, change):
        obj.owner = request.user
        obj.save()
admin.site.register(Entry, EntryAdmin)

# serializers.py
from prompt.models import Entry
from rest_framework import serializers

class EntrySerializer(serializers.HyperlinkedModelSerializer):
    owner = serializers.HiddenField(default=serializers.CurrentUserDefault())
    class Meta:
        model = Entry
        fields = ('pk','owner','title', 'prompt', 'created')

# views.py
from prompt.models import Entry
from rest_framework import viewsets
from rest_framework import permissions
from prompt.serializers import EntrySerializer

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the snippet.
        return obj.owner == request.user


class EntryViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = Entry.objects.all()
    serializer_class = EntrySerializer
    permission_classes = (permissions.AllowAny,)
    # uncomment for production/staging
    # permission_classes = (permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly,)

```

