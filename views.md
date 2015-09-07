
Views imports
-------------
```python
from django.http import HttpResponse, HttpResponseRedirect
from django.http import Http404t

from django.shortcuts import render_to_response
from django.shortcuts import redirect
from django.shortcuts import render
from django.shortcuts import get_object_or_404
from django.core.urlresolvers import reverse

from django.template import RequestContext
from django.db.models.loading import get_model
from django.views.generic import ListView
from django.db.models import Count

from django.contrib.auth.decorators import login_required, user_passes_test
from django.utils.decorators import method_decorator
from django.conf import settings

from another_app.models import YourModel
from another_app.views import is_foo

from django.contrib.auth.models import User

# DRF View imports
from snippets.models import Snippet
from snippets.serializers import SnippetSerializer
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

def my_view(request):
    ...
    return redirect('some-view-name', foo='bar')

def login(request):
    # how to grab request context
    context = RequestContext(request, {
         'request': request, 'user': request.user})
    return render_to_response('login.html', context_instance=context)
    
def index(request, template='journal/index.html'):
    # Redirect if not logged in.
    if not request.user.is_authenticated():
        return HttpResponse('you must be logged in')
    context = None
    return render(request, template, context)
```


Views 
-----
```python
# docs: https://docs.djangoproject.com/en/1.8/ref/contrib/auth/

from rango.forms import UserForm, UserProfileForm

def register(request):

    # A boolean value for telling the template whether the registration was successful.
    # Set to False initially. Code changes value to True when registration succeeds.
    registered = False

    # If it's a HTTP POST, we're interested in processing form data.
    if request.method == 'POST':
        # Attempt to grab information from the raw form information.
        # Note that we make use of both UserForm and UserProfileForm.
        user_form = UserForm(data=request.POST)
        profile_form = UserProfileForm(data=request.POST)

        # If the two forms are valid...
        if user_form.is_valid() and profile_form.is_valid():
            # Save the user's form data to the database.
            user = user_form.save()

            # Now we hash the password with the set_password method.
            # Once hashed, we can update the user object.
            user.set_password(user.password)
            user.save()

            # Now sort out the UserProfile instance.
            # Since we need to set the user attribute ourselves, we set commit=False.
            # This delays saving the model until we're ready to avoid integrity problems.
            profile = profile_form.save(commit=False)
            profile.user = user

            # Did the user provide a profile picture?
            # If so, we need to get it from the input form and put it in the UserProfile model.
            if 'picture' in request.FILES:
                profile.picture = request.FILES['picture']

            # Now we save the UserProfile model instance.
            profile.save()

            # Update our variable to tell the template registration was successful.
            registered = True

        # Invalid form or forms - mistakes or something else?
        # Print problems to the terminal.
        # They'll also be shown to the user.
        else:
            print user_form.errors, profile_form.errors

    # Not a HTTP POST, so we render our form using two ModelForm instances.
    # These forms will be blank, ready for user input.
    else:
        user_form = UserForm()
        profile_form = UserProfileForm()

    # Render the template depending on the context.
    return render(request,
            'rango/register.html',
            {'user_form': user_form, 'profile_form': profile_form, 'registered': registered} )

from django.http import Http404
def my_view(request):
    try:
        my_object = MyModel.objects.get(pk=1)
    except MyModel.DoesNotExist:
        raise Http404("No MyModel matches the given query.")
```

Django user model actions
-----------------------
```python
from django.contrib.auth import get_user_model

User = get_user_model()
u = User(username='foo', email='myemail', is_active=True)
u.save()

```

Django unit tests
--------------
```python

def setUp(self):
    rf = RequestFactory()
    api_client = 

def test_that_page_serves_correct_content(self):

def test_that_url_exists(self):

def test_response(self):
    # GET NOT ALLOWED
    
    # POST response is correct format

```



'''
Django class based view (CBV) overrides
--------------------------------------
```python

class DojoSearchResultView(ListView):
    model = MyModel
    template_name="myapp/myapp_search.html"
    queryset = MyModel.objects.all()
    
    def dispatch(self, request, q, *args, **kwargs):
        # do stuff here...
        self.extra_context = [1,2,3]
        return super(MyView, self).dispatch(request, q, *args, **kwargs)

    def get_context_data(self, **kwargs):
        # Call the base implementation first to get a context
        context = super(MyView, self).get_context_data(**kwargs)
        context.update(self.extra_context)
        return context
        
    def get_queryset(self):
        queryset = super(MyView, self).get_queryset()
        queryset = MyModel.objects.filter(foo=True)
        return queryset
        
# login decorator

from django.views.generic import View
from django.views.generic.base import TemplateView, TemplateResponseMixin, ContextMixin
django.utils.decorators import method_decorator 
from django.contrib.auth.decorators import login_required

class MyView(ContextMixin, TemplateResponseMixin, View):
    @method_decorator(login_view)
    def get(self, request, *args, **kwargs):
        context = self.get_context_data(**kwargs)
        context["title"] = "some other title"
        return self.render_to_response(context)
```

