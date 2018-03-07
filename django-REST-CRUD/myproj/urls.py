
from django.conf.urls import url, include
from django.contrib import admin
from rest_framework_jwt.views import obtain_jwt_token

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^api/auth/login/$', obtain_jwt_token, name='api-login'),
    url(r'^api/postings/', include('MYAPP.api.urls', namespace='api-postings')),
]