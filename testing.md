
Running tests
-------------
```
./manage.py test
./manage.py test path/to/tests/
```

Example: Using unittest.mock (Python 3)
------
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

import braintree
from apps.billing import views as billing_views
from apps.billing.views import upgrade_view, upgrade_view_formpost, create_usermerchant

braintree.Configuration.configure(braintree.Environment.Sandbox,
                          merchant_id="ABC",
                          public_key="ABC",
                          private_key="ABC")

SUBSCRIPTION_PLAN_ID = 'ABC'


class CreateUserMerchantView(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.c = Client()
        self.user1 = MyUser.objects.create_user(username='admin', email='testadmin@foo.com', password='test12345')
        self.user2 = MyUser.objects.create_user(username='test', email='test@foo.com', password='test12345')


    def should_handle_when_usermerchantid_exists(self):
        request = self.factory.post(reverse('upgrade_view_formpost'))
        request.user = self.user1
        expected_id = 'abc123'
        UserMerchantId.objects.create(user=request.user, customer_id=expected_id)
        created_merchant_id = create_usermerchant(request)
        self.assertEqual(created_merchant_id, expected_id)


    @patch('apps.billing.views.braintree')
    def should_handle_when_usermerchant_doesnotexist_and_result_is_success(self, braintree_mock):
        request = self.factory.post(reverse('upgrade_view_formpost'))
        request.user = self.user1
        expected_id = 'abc123'
   
        result_mock = mock.Mock()
        result_mock.customer = mock.Mock()
        result_mock.customer.id = expected_id
        result_mock.is_success = True
        braintree_mock.Customer.create.return_value = result_mock

        created_merchant_id = create_usermerchant(request)
        self.assertEqual(created_merchant_id, expected_id)

    @patch('apps.billing.views.braintree')
    def should_handle_when_usermerchant_doesnotexist_and_result_not_success(self, braintree_mock):
        request = self.factory.post(reverse('upgrade_view_formpost'))
        # ignore messages
        setattr(request, 'session', 'session')
        messages = FallbackStorage(request)
        setattr(request, '_messages', messages)
        request.user = self.user1
        expected_id = 'abc123'

        result_mock = mock.Mock()
        result_mock.customer = mock.Mock()
        result_mock.customer.id = expected_id
        result_mock.is_success = False
        braintree_mock.Customer.create.return_value = result_mock

        response = create_usermerchant(request)
        self.assertEqual(response.status_code, 302)

    @patch('apps.billing.views.UserMerchantId.objects.get')
    def should_handle_unexpected_exception(self, get_method_mock):
        request = self.factory.post(reverse('upgrade_view_formpost'))
        setattr(request, 'session', 'session')
        messages = FallbackStorage(request)
        setattr(request, '_messages', messages)
        request.user = self.user1

        get_method_mock.side_effect = Exception()

        result = create_usermerchant(request)
        self.assertEqual(result.status_code, 302)


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
```