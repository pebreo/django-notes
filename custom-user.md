
models.py
---------
```python
import logging
import braintree
from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser
from django.conf import settings
from django.db.models.signals import post_save
from django.db import IntegrityError
from django.utils import timezone
from django.contrib.auth.signals import user_logged_in
from apps.notifications.signals import notify
from apps.billing.models import Membership, UserMerchantId

logger = logging.getLogger()

braintree.Configuration.configure(braintree.Environment.Sandbox,
                          merchant_id=settings.BRAINTREE_MERCHANT_ID,
                          public_key=settings.BRAINTREE_PUBLIC_KEY,
                          private_key=settings.BRAINTREE_PRIVATE_KEY)


class CustomerCreateError(Exception):
    pass

class MyUserManager(BaseUserManager):
    def create_user(self, username=None, email=None, password=None):
        """
        Creates and saves a User with the given username, email, and password.
        """
        if not username:
            raise ValueError('Must have username')

        if not email:
            raise ValueError('Users must have an email address')

        # if username.__contains__('admin'):
        #     from random import randint
        #     flag = True
        #     while flag:
        #         num = randint(1,500)
        #         email = "%s%s@foo.com" % (username, num)
        #         username = "%s%s" % (username, num)
        #         password = username
        #         try:
        #             usr, created = self.get_or_create(username=username, 
        #                                         email=self.normalize_email(email))
        #             # it does not exist
        #             if created and usr is not None:
        #                 print(username)
        #                 flag = False
        #             else:
        #                 flag = True
        #         except IntegrityError:
        #             flag = True
        try:
            user = self.model(
                username=username,
                email=self.normalize_email(email)
            )
            user.set_password(password)
            user.save(using=self._db)
            return user                
        except IntegrityError:
            raise ValueError('Username or email exists: %s - %s' %(username, email))
        return user

    def create_superuser(self, username, email, password):
        """
        Creates and saves a superuser with the given email, username, password.
        """
        user = self.create_user(
            username=username,
            email=email,
            password=password
        )
        user.is_admin = True
        user.save(using=self._db)
        return user


class MyUser(AbstractBaseUser):

    username = models.CharField(
        max_length=255,
        unique=True,
    )

    email = models.EmailField(
        verbose_name='email address',
        max_length=255,
        unique=True,
    )
    first_name = models.CharField(max_length=120, null=True, blank=True)
    last_name = models.CharField(max_length=120, null=True, blank=True)
    is_member = models.BooleanField(default=False, verbose_name="Is Paid Member")
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)

    timestamp = models.DateTimeField(auto_now_add=True, auto_now=False, null=True)
    updated = models.DateTimeField(auto_now_add=False, auto_now=True, null=True)


    objects = MyUserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def get_full_name(self):
        # The user is identified by their email address
        return "%s %s" % (self.first_name, self.last_name)

    def get_short_name(self):
        # The user is identified by their email address
        return self.username

    def __str__(self):              # __unicode__ on Python 2
        return self.username

    def has_perm(self, perm, obj=None):
        "Does the user have a specific permission?"
        # Simplest possible answer: Yes, always
        return True

    def has_module_perms(self, app_label):
        "Does the user have permissions to view the app `app_label`?"
        # Simplest possible answer: Yes, always
        return True

    @property
    def is_staff(self):
        "Is the user a member of staff?"
        # Simplest possible answer: All admins are staff
        return self.is_admin


class UserProfile(models.Model):
    user = models.OneToOneField(MyUser)
    bio = models.TextField(null=True, blank=True)
    facebook_link = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        verbose_name='Facebook profile url'
    )
    twitter_link = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        verbose_name='Twitter handle'
    )

    def __str__(self):
        return self.user.username

def create_usermerchant(user, email):
    merchant_customer_id = None
    try:
        new_customer_result = braintree.Customer.create({
            "email": email,
            })
        if new_customer_result.is_success:
            merchant_obj, created = UserMerchantId.objects.get_or_create(user=user,
                                          customer_id=new_customer_result.customer.id)
        else:
            logger.error('error %s' % new_customer_result.message)
            raise CustomerCreateError('New customer result unsuccessful')
    except:
        raise


def new_user_receiver(sender, instance, created, *args, **kwargs):
    '''
    Signal to save a unique slug
    '''
    if created:
        # create new user profile
        try:
            new_profile, is_created = UserProfile.objects.get_or_create(user=instance)
            notify.send(sender=instance,
                verb='new user created',
                action_object=new_profile,
                target=None,
                recipient='admin')
            create_usermerchant(instance, instance.email)
        except CustomerCreateError:
            logger.error('Customer creation error')
            raise Http404
        except Exception as e:
            logger.error('Unknown exception >>>>')
            logger.exception(e)
            raise
        # create braintree customer id

        # send email for verifying user

def update_membership_status(user):
    member_obj, created = Membership.objects.get_or_create(user=user)
    if created:
        member_obj.user.is_member = False
        member_obj.user.save()
    member_obj.update_status()

def user_logged_in_receiver(sender, request, user, **kwargs):
    request.session.set_expiry(60000)
    user = request.user
    update_membership_status(user)

# built-in signal
post_save.connect(new_user_receiver, sender=MyUser)
# built-in signal
user_logged_in.connect(user_logged_in_receiver)
```


views.py
--------
```python
import logging
from django.contrib.auth import authenticate, login, logout
from django.shortcuts import render, redirect
from django.core.urlresolvers import reverse
from django.contrib import messages
from django.contrib.auth import authenticate
from django.contrib.auth import login
from django.http import Http404
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth.decorators import login_required
from apps.videos.models import Video
from django.utils.safestring import mark_safe
from django.contrib import messages
from django.db import IntegrityError

from apps.accounts.forms import LoginForm
from apps.accounts.forms import RegisterForm
from apps.accounts.models import MyUser
from apps.notifications.models import Notification
from apps.notifications.signals import notify
from apps.videos.models import Video, Category

logger = logging.getLogger()

def auth_logout(request):
    logout(request)
    return HttpResponseRedirect(reverse('home'))

def auth_login(request):
    #print(reverse('mylogin'))
    login_form = LoginForm(request.POST or None)
    register_form = RegisterForm(request.POST or None)
    next_url = request.GET.get('next')
    template = 'home/home_visitor.html'
    if login_form.is_valid():
        username = login_form.cleaned_data['username']
        password = login_form.cleaned_data['password']
        user = authenticate(username=username, password=password)
        if user is not None:
            login(request, user)
            request.session['has_notifications'] = Notification.objects.has_notifications(request.user)
            if next_url is not None:
                return redirect(next_url)
            return redirect(reverse('home'))
        else:
            messages.success(request, 'Invalid login - Try again.',extra_tags='alert-danger')
            return redirect(reverse('login'))
    featured_videos = Video.objects.get_featured()
    featured_categories = Category.objects.get_featured()
    context = {
        'login_form': login_form,
        'register_form': register_form,
        'featured_videos': featured_videos,
        'featured_categories': featured_categories,
        'next': next_url,
    }
    return render(request, template, context)

def auth_register(request):
    form = RegisterForm()
    context = {
        'register_form': form,
        'action_value': '',
        'submit_btn_value': 'Register',
        'username_email_taken': False,
    }
    return render(request, 'home/home_visitor.html', context)

def register_submit(request):
    if request.method == 'POST':
        print('posting')
        form = RegisterForm(request.POST)
        username_email_taken = False
        if form.is_valid():
            username = form.cleaned_data['username']
            email = form.cleaned_data['email']
            password = form.cleaned_data['password2']
            try:
                new_user = MyUser.objects.create_user(username=username, email=email, password=password)
                messages.success(request, 'Welcome to DashAccounting. You have successfully registered.', extra_tags='alert-success')
                notify.send(sender=request.user,
                                verb='new user created',                          
                                recipient='admin',
                                recipient_admin=True,
                    )
                user = authenticate(username=username, password=password)
                login(request, user)
                return HttpResponseRedirect(reverse('home'))
            except Exception as e:
                logger.error(">>> MyUser.objects.create_user error - path %s" % request.path)
                logger.exception(e)
                raise Http404
            # add message for success
        return render(request, 'home/home_visitor.html', {'register_form':form, 'username_email_taken': username_email_taken,})
    return HttpResponseRedirect(reverse('register'))
```


forms.py
-------
```python
from django.contrib import admin
from django import forms
from django.core.exceptions import ValidationError
from django.contrib import admin
from django.contrib.auth.models import Group
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import ReadOnlyPasswordHashField

from apps.accounts.models import MyUser


class LoginForm(forms.Form):
    username = forms.CharField(label="Username")
    password = forms.CharField(widget=forms.PasswordInput)


class RegisterForm(forms.Form):
    username = forms.CharField()
    email = forms.EmailField()
    password1 = forms.CharField(label='Password', widget=forms.PasswordInput)
    password2 = forms.CharField(label='Password confirmation',widget=forms.PasswordInput)

    def clean_password2(self):
        # Check that the two password entries match
        password1 = self.cleaned_data.get("password1")
        if len(password1) <= 4:
            raise forms.ValidationError("Password is too short")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("Passwords don't match")
        return password2

    def clean_username(self):
        username = self.cleaned_data.get("username")
        if MyUser.objects.filter(username=username).exists():
            raise forms.ValidationError('This username already exists.')
        return username

    def clean_email(self):
        email = self.cleaned_data.get("email")
        if MyUser.objects.filter(email=email).exists():
            raise forms.ValidationError('This email already exists.')
        return email

class UserCreationForm(forms.ModelForm):
    """A form for creating new users. Includes all the required
    fields, plus a repeated password."""
    password1 = forms.CharField(label='Password', widget=forms.PasswordInput)
    password2 = forms.CharField(label='Password confirmation', widget=forms.PasswordInput)

    class Meta:
        model = MyUser
        fields = ('email', 'username', 'first_name', 'last_name')

    def clean_password2(self):
        # Check that the two password entries match
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("Passwords don't match")
        return password2

    def save(self, commit=True):
        # Save the provided password in hashed format
        user = super(UserCreationForm, self).save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user


class UserChangeForm(forms.ModelForm):
    """A form for updating users. Includes all the fields on
    the user, but replaces the password field with admin's
    password hash display field.
    """
    password = ReadOnlyPasswordHashField()

    class Meta:
        model = MyUser
        fields = ('email', 'password', 'username', 'first_name', 'last_name',  'is_active', 'is_admin', 'is_member')

    def clean_password(self):
        # Regardless of what the user provides, return the initial value.
        # This is done here, rather than on the field, because the
        # field does not have access to the initial value
        return self.initial["password"]
```


admin.py
-------
```python
from django.contrib import admin
from django import forms
from django.contrib import admin
from django.contrib.auth.models import Group
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import ReadOnlyPasswordHashField

from apps.accounts.models import MyUser, UserProfile
from apps.accounts.forms import UserCreationForm, UserChangeForm

class MyUserAdmin(UserAdmin):
    # The forms to add and change user instances
    form = UserChangeForm
    add_form = UserCreationForm

    # The fields to be used in displaying the User model.
    # These override the definitions on the base UserAdmin
    # that reference specific fields on auth.User.
    readonly_fields = ('timestamp','updated')
    list_display = ('username', 'email', 'is_admin', 'is_member')
    list_filter = ('is_admin','is_member')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name','last_name','username')}),
        ('Permissions', {'fields': ('is_admin','is_member')}),
        ('Meta', {'fields': ('timestamp','updated')}),
    )
    # add_fieldsets is not a standard ModelAdmin attribute. UserAdmin
    # overrides get_fieldsets to use this attribute when creating a user.
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username','email', 'password1', 'password2', 'first_name','last_name')}
        ),
    )
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('-timestamp','is_member')
    filter_horizontal = ()


# Now register the new UserAdmin...
admin.site.register(MyUser, MyUserAdmin)
admin.site.register(UserProfile)
# ... and, since we're not using Django's built-in permissions,
# unregister the Group model from admin.
admin.site.unregister(Group)
```

urls.py
-------
```python
urlpatterns += patterns('',
    url(r'^logout/', accounts_views.auth_logout, name='logout'),
    url(r'^login/', accounts_views.auth_login, name='login'),
    url(r'^register/submit/', accounts_views.register_submit, name='register_submit'),
    url(r'^register/', accounts_views.auth_register, name='register'),
    
)
```

tests.py
-------
```python
import logging
from unittest.mock import patch
import unittest.mock as mock
from unittest.loader import TestLoader
TestLoader.testMethodPrefix = 'should' 
from django.test import TestCase, RequestFactory
from unittest import skip
from django.core.urlresolvers import reverse
from django.core.urlresolvers import resolve
from django.contrib import messages
from django.http import Http404
from apps.accounts.models import MyUser
from apps.billing.models import UserMerchantId
from apps.billing.views import upgrade_view
from django.test import Client
from django.contrib import auth
from django.contrib.messages.storage.fallback import FallbackStorage

import apps.accounts.views as accounts_views

class AuthRegisterSubmitTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.user1 = MyUser.objects.create_user(username='admin', email='testadmin@foo.com', password='test12345')
        self.user2 = MyUser.objects.create_user(username='existing', email='existing@email.com', password='validpassword123')


    def should_resolve_to_register_submit(self):
        url = reverse('register_submit')
        self.assertEqual(url, '/register/submit/')

        resolver = resolve('/register/submit/')
        self.assertEqual(resolver.view_name, 'register_submit')   

        resp = self.client.get('/register/submit/')
        self.assertEqual(resp.resolver_match.func, accounts_views.register_submit)


    def should_redirect_when_get_method(self):
        resp = self.client.get(reverse('register_submit'))
        self.assertEqual(resp.status_code, 302)


    def should_redirect_when_valid_userinfo(self):
        context = {
            'username': 'foo',
            'email': 'validemail@email.com',
            'password1': 'validpassword123',
            'password2': 'validpassword123',
        }
        resp = self.client.post(reverse('register_submit'), context)
        self.assertEqual(resp.status_code, 302)
        self.assertEqual(resp['Location'], 'http://testserver/')

    def should_write_user_when_valid_info(self):
        context = {
            'username': 'foo',
            'email': 'validemail@email.com',
            'password1': 'validpassword123',
            'password2': 'validpassword123',
        }
        resp = self.client.post(reverse('register_submit'), context)
        user_exists = MyUser.objects.filter(username='foo').exists()
        self.assertTrue(user_exists)


    def should_give_error_when_user_exists(self):
        context = {
            'username': 'existing',
            'email': 'existing@email.com',
            'password1': 'validpassword123',
            'password2': 'validpassword123',
        }
        resp = self.client.post(reverse('register_submit'), context)
        self.assertFormError(resp, 'register_form', 'username', 'This username already exists.')
        self.assertFormError(resp, 'register_form', 'email', 'This email already exists.')
        self.assertEqual(resp.status_code, 200)

'''
messages
r = self.clientlient.post('/foo/')
m = list(r.context['messages'])
self.assertEqual(len(m), 1)
self.assertEqual(str(m[0]), 'my message')

'''
```

register_form.html
--------
```html
{% extends 'srvup/base.html' %}
{% load staticfiles %}


{% block head_title %}Welcome | {% endblock %}


{% block content %}
  <div class="row">
    <div class="col-sm-6 col-sm-offset-3" style="text-align:center">
      <h1>Register a new Account</h1>
      <form class="form" method="POST" action="{% url 'register' %}">{% csrf_token %}
        {{ form.as_p }}
        <input class="btn btn-default" type="Submit" value="Create Free Account">
        </form>
    </div>
  </div>




{% endblock %}

```