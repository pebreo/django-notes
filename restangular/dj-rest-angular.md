# See `templates/` and `static/` folders for the rest of the Angular files


ADDING ANGULAR TO DJANGO PROJECT
-----
* Add app to `/static` folder
* Serve templates using a custom `AngularTemplateView`


FULL EXAMPLE OF ANGULAR 1.x + DJANGO REST
------
The best way to use angular with django is to setup Django REST Framework
and `Django REST JWT`.  You will use the token created be `Django REST JWT`
to pass to Angular. You will have a special variable in angular that
will hold the token.

Explanation about authentication for Angular + Django

You have two choices when doing authentication for Angular + Django:
The first choice is to use the built-in Django authentication. 
Using that, you can restrict what users can see in a template
and which django views they are allowed to view.

The other choice for use authentication is to use JSON Web Tokens 
(JWT). The way JWT works is the angular app prompts
the user for a password and POSTs it to a Django REST view
which then returns a token to the angular app.
If you use JWT, all the authentication must be handled using
cookies like this:

```javascript
var loginUrl = '/api/auth/token/'
$scope.doLogin = function(user){
    console.log(user)

    var reqConfig = {
        method: "POST",
        url: loginUrl,
        data: {
            email: user.email,
            password: user.password
        },
        headers: {}
    }
    var requestAction = $http(reqConfig)

    requestAction.success(function(r_data, r_status, r_headers, r_config){
            $cookies.put("token", r_data.token);
            $cookies.put("email", user.email);
            // message
            $location.path("/")
    })
    requestAction.error(function(e_data, e_status, e_headers, e_config){
            console.log(e_data) // error
    })

}

if ($scope.loggedIn) {
    // do stuff 
}
```

## verify JWT token and endpoint with curl
====
```bash
$curl -X POST -d "username=cfe&password=learncode" http://127.0.0.1:8000/api/auth/token/

abc123xyz

$curl -H "Authorization: JWT abc123xyz" http://127.0.0.1:8000/api/comments/


curl -X POST -H "Authorization: JWT abc123xyz" -H "Content-Type: application/json" -d '{"content":"some reply to another try"}' 'http://127.0.0.1:8000/api/comments/create/?slug=new-title&type=post&parent_id=13'


curl http://127.0.0.1:8000/api/comments/
```

Here is a full example of a simple login AngularJS + DjangoREST app
that includes the following sections:

* `settings.py` - set up specific read/write permissions for DJ REST
* `urls.py` - setup the endpoints
* `views.py` - contains a view to render Angular templates as a file
  but you probably want use AWS S3 to serve these because I found
  out that this is slow in production
* `templates/restangular` - the html that angular will used here must be served using `AngularTemplateView`
* `static/app` - all the angular app files will be here


## requirements.txt
----
```
djangorestframework==3.5.4
djangorestframework-jwt==1.11.0
```

## settings.py
----
```python

INSTALLED_APPS = [
    #...
    'rest_framework',
    #...
    'apps.angular',
]

STATIC_URL = '/static/'
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, "static"),
]

MEDIA_URL = '/static/media/'
MEDIA_ROOT= os.path.join(BASE_DIR, 'static', 'media')


REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],
    # 'DEFAULT_PARSER_CLASSES': (
    #     'rest_framework.parsers.JSONParser',
    # )
    "DEFAULT_AUTHENTICATION_CLASSES": [
         #'rest_framework.authentication.SessionAuthentication',
         'rest_framework_jwt.authentication.JSONWebTokenAuthentication',
        #'rest_framework.authentication.BasicAuthentication'

    ],
    "DEFAULT_PERMISSION_CLASSES": [
        'rest_framework.permissions.DjangoModelPermissionsOrAnonReadOnly'
        #'rest_framework.permissions.IsAuthenticated',
        #'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ]
}

```

## urls.py
=====
```python

from rest_framework import routers
router = routers.DefaultRouter()
router.register(r'videos', video_views.VideoViewSet)

from django.views.generic.base import TemplateView
from rest_framework_jwt.views import obtain_jwt_token

from apps.angular.views import AngularTemplateView

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


urlpatterns += [

    # uses jwt for authentication
    url(r'^api/auth/token/', obtain_jwt_token),
    url(r'^api/templates/(?P<item>[A-Za-z0-9\_\-\.\/]+)\.html$',  AngularTemplateView.as_view())

]
```

## views.py
=====
```python

# apps/angular

import os

from django.conf import settings
from django.http import HttpResponse, Http404

from django.views.generic import View

from django.shortcuts import render

class AngularTemplateView(View):
    def get(self, request, item=None, *args, **kwargs):
        print(item)
        template_dir_path = settings.TEMPLATES[0]["DIRS"][0]
        final_path = os.path.join(template_dir_path, "restangular", "app", item + ".html" )
        try:
            html = open(final_path)
            return HttpResponse(html)
        except:
            raise Http404

```


## templates - login
---
```html
// templates/restangular
// login-detail.html

<div class='col-sm-6 col-sm-offset-3'>
    <h1>Login</h1>
    <form ng-submit='doLogin(user)'>
    <input type='text' ng-model='user.email' class='form-control' placeholder='Username'>
    <input type='password' ng-model='user.password' class='form-control'  placeholder='Password'>
    <input type='submit' value='Login' class='btn btn-default' />
    </form>
</div>

```

# See `templates/` and `static/` folders for the rest of the Angular files

