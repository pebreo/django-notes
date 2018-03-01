CRUD operations with Django REST + Angular 
---
The following are the important files involved in
CRUD operations with Django (backend) and AngularJS 1.5.x (frontend)

### backend (django)
* `comments/api/serializers.py`
* `comment/api/views.py`
* `comments/api/urls.py`

### frontend (angular)
* `myapp/urls.py`
* `js/app/core/comments.service.js`


## `serializers.py`
```python
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth import get_user_model

from rest_framework import serializers
from rest_framework.serializers import (
    HyperlinkedIdentityField,
    ModelSerializer,
    SerializerMethodField,
    ValidationError
    )

from accounts.api.serializers import UserDetailSerializer

from comments.models import Comment

User = get_user_model()


class CommentCreateSerializer(ModelSerializer):
    # ...


def create_comment_serializer(model_type='post', slug=None, parent_id=None, user=None):
    # ...



class CommentSerializer(ModelSerializer):
    # ...



class CommentListSerializer(ModelSerializer):
    # ...



class CommentChildSerializer(ModelSerializer):
    # ...



class CommentDetailSerializer(ModelSerializer):
    # ...

```

## `views.py`
```python
from django.contrib.contenttypes.models import ContentType
from django.db.models import Q
from rest_framework.filters import (
        SearchFilter,
        OrderingFilter,
    )

from rest_framework.mixins import DestroyModelMixin, UpdateModelMixin
from rest_framework.generics import (
    CreateAPIView,
    DestroyAPIView,
    ListAPIView, 
    UpdateAPIView,
    RetrieveAPIView,
    RetrieveUpdateAPIView
    )
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
    IsAdminUser,
    IsAuthenticatedOrReadOnly,

    )

from posts.api.permissions import IsOwnerOrReadOnly
from posts.api.pagination import PostLimitOffsetPagination, PostPageNumberPagination

from comments.models import Comment


from .serializers import (
    CommentCreateSerializer,
    CommentListSerializer,
    CommentDetailSerializer,
    create_comment_serializer
    )


class CommentCreateAPIView(CreateAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentCreateSerializer

    def get_serializer_context(self):
        context = super(CommentCreateAPIView, self).get_serializer_context()
        context['user'] = self.request.user
        return context


class CommentDetailAPIView(DestroyModelMixin, UpdateModelMixin, RetrieveAPIView):
    queryset = Comment.objects.filter(id__gte=0)
    serializer_class = CommentDetailSerializer
    permission_classes = [IsOwnerOrReadOnly]

    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)



class PostUpdateAPIView(RetrieveUpdateAPIView):
    # ...



class PostDeleteAPIView(DestroyAPIView):
    # ...


class CommentListAPIView(ListAPIView):
    serializer_class = CommentListSerializer
    permission_classes = [AllowAny]
    filter_backends= [SearchFilter, OrderingFilter]
    search_fields = ['content', 'user__first_name']
    pagination_class = PostPageNumberPagination #PageNumberPagination

    def get_queryset(self, *args, **kwargs):
        # ...
        return queryset_list

```

## `urls.py`
```python
from django.conf.urls import url
from django.contrib import admin

from .views import (
    CommentCreateAPIView,
    CommentDetailAPIView,
    CommentListAPIView,
    )

urlpatterns = [
    url(r'^$', CommentListAPIView.as_view(), name='list'),
    url(r'^create/$', CommentCreateAPIView.as_view(), name='create'),
    url(r'^(?P<pk>\d+)/$', CommentDetailAPIView.as_view(), name='thread'),
    #url(r'^(?P<id>\d+)/delete/$', comment_delete, name='delete'),
]
```

## `myapp/urls.py`
```python
from django.conf import settings
from django.conf.urls import include, url
from django.conf.urls.static import static
from django.contrib import admin
from django.views.generic.base import TemplateView
from rest_framework_jwt.views import obtain_jwt_token

from ang.views import AngularTemplateView

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^api/auth/token/', obtain_jwt_token),
    url(r'^api/users/', include("accounts.api.urls", namespace='users-api')),
    url(r'^api/comments/', include("comments.api.urls", namespace='comments-api')),
    url(r'^api/posts/', include("posts.api.urls", namespace='posts-api')),
    url(r'^api/templates/(?P<item>[A-Za-z0-9\_\-\.\/]+)\.html$',  AngularTemplateView.as_view())
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns +=  [
    url(r'', TemplateView.as_view(template_name='ang/home.html'))
]

```

## `comments.service.js`
```javascript
'use strict';

angular.
    module('core.comment').
        factory('Comment', function(LoginRequiredInterceptor, $cookies, $httpParamSerializer, $location, $resource){
            var url = '/api/comments/:id/'
            var commentQuery = {
                url: url,
                method: "GET",
                params: {},
                isArray: true,
                cache: false,
                transformResponse: function(data, headersGetter, status){
                    // console.log(data)
                    var finalData = angular.fromJson(data)
                    return finalData.results
                }
            }

            var commentGet = {
                    method: "GET",
                    params: {"id": "@id"},
                    isArray: false,
                    cache: false,
                    // interceptor: {responseError: function(response){
                    //     if (response.status == 404) {
                    //         $location.path('/404')
                    //     }
                    // }}
                }

             var commentCreate = {
                    url: '/api/comments/create/',
                    method: "POST", 
                    interceptor: {responseError: LoginRequiredInterceptor}
                    // params: {"id": "@id"},
                    // isArray: false,
                    // cache: false,
                }
            var commentUpdate = {
                    url: '/api/comments/:id/',
                    method: "PUT",
                    interceptor: {responseError: LoginRequiredInterceptor}
                    // params: {"id": "@id"},
                    // isArray: false,
                    // cache: false,
                }

             var commentDelete = {
                    url: '/api/comments/:id/',
                    method: "DELETE",
                    interceptor: {responseError: LoginRequiredInterceptor}
                    // params: {"id": "@id"},
                    // isArray: false,
                    // cache: false,
                }

            var token = $cookies.get("token")
            if (token){
                commentCreate["headers"] = {"Authorization": "JWT " + token}
                commentDelete["headers"] = {"Authorization": "JWT " + token}
                commentUpdate["headers"] = {"Authorization": "JWT " + token}
            }

            return $resource(url, {}, {
                query: commentQuery,
                get: commentGet,
                create: commentCreate,
                delete: commentDelete,
                update: commentUpdate,
            })

        });
```

source:
https://github.com/codingforentrepreneurs/Django-AngularJS