Overview
---------
In Django, we can use python-socialauth to 
make it easier for our users to register and login to our website.
You will need to change the following files to enable social auth in Django:
* `requirements.txt`
* `settings.py`
* `views.py`
* templates
* using makemigrations and 

Source:

https://realpython.com/blog/python/adding-social-authentication-to-django/

##### requirements.txt
```
Django==1.8.15
python-socia-auth==0.2.18
```

#### new project
```
./manage.py startapp socialapp

./manage.py migrate
./manage.py createsuperuser

# config.py
SOCIAL_AUTH_TWITTER_KEY = 'update me'
SOCIAL_AUTH_TWITTER_SECRET = 'update me'

SOCIAL_AUTH_LOGIN_REDIRECT_URL = '/home/'
SOCIAL_AUTH_LOGIN_URL = '/'
```

##### settings.py
```python
from config import * 

INSTALLED_APPS = (
...
'socialapp',
'social.apps.django_app.default',
)

TEMPLATE_CONTEXT_PROCESSORS = (
    'django.contrib.messages.context_processors.messages',
    'social.apps.django_app.context_processors.backends',
    'social.apps.django_app.context_processors.login_redirect',
)

AUTHENTICATION_BACKENDS = (
    'social.backends.facebook.FacebookOAuth2',
    'social.backends.google.GoogleOAuth2',
    'social.backends.twitter.TwitterOAuth',
    'django.contrib.auth.backends.ModelBackend',
)
```


##### migrations
```
./manage.py makemigrations

./manage.py migrate
```

#### urls.py
```python
urlpatterns = patterns(
    '',
    url(r'^admin/', include(admin.site.urls)),
    url('', include('social.apps.django_app.urls', namespace='social')),
    url(r'^$', 'socialapp.views.login'),
    url(r'^home/$', 'socialapp.views.home'),
    url(r'^logout/$', 'socialapp.views.logout'),
)

#### views.py
```python
from django.shortcuts import render_to_response, redirect, render
from django.contrib.auth import logout as auth_logout
from django.contrib.auth.decorators import login_required
# from django.template.context import RequestContext


def login(request):
    # context = RequestContext(request, {
    #     'request': request, 'user': request.user})
    # return render_to_response('login.html', context_instance=context)
    return render(request, 'login.html')


@login_required(login_url='/')
def home(request):
    return render_to_response('home.html')


def logout(request):
    auth_logout(request)
    return redirect('/')
```

##### templates
##### home.html
```html
<h1>Welcome</h1>
<p><a href="/logout">Logout</a>
```

##### login.html
```html
 {% if user and not user.is_anonymous %}
  <a>Hello, {{ user.get_full_name }}!</a>
  <br>
  <a href="/logout">Logout</a>
{% else %}
  <a href="{% url 'social:begin' 'twitter' %}?next={{ request.path }}">Login with Twitter</a>
{% endif %}
```