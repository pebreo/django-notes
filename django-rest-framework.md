

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

Custom URL
---------
``` python

# urls.py 
from rest_framework import routers
router = routers.DefaultRouter()
router.register(r'journal', journal_views.Entry
)
router.register(r'prompt', prompt_views.EntryViewSet)

urlpatterns = [
    url(r'^api/', include(router.urls)),
]

# views.py
from prompt.models import Entry
from rest_framework import viewsets
from prompt.serializers import EntrySerializer

class EntryViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = Entry.objects.all()
    serializer_class = EntrySerializer
    # permission_classes = (permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly,)
```




