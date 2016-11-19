Overview
--------
If you want to send users emails then it is a
good idea to use a dedicated email service like SendGrid.

You will need to change the following in your Django project:
* `settings.py`
* `views.py`

### SendGrid setup
Requirements:
* registered domain
* an email service ie SendGrid
Steps:
```
Settings -> Whitelabels -> Domains
Add Whitelabel
Use New Domain
Save

Create CNAME records
then Validate Record

Settings -> Credentials
Add New Credential
Create Credential
```

### Django
#### `settings.py`
```python
EMAIL_HOST = 'smtp.sendgrid.net'
EMAIL_PORT = 587
EMAIL_HOST_USER = 'parsifal_app'
EMAIL_HOST_PASSWORD = 'mys3cr3tp4ssw0rd'
EMAIL_USE_TLS = True
```

##### `views.py` or `models.py` (in a signal)
```python
from django.core.email import send_mail
send_mail('subject','body of message', 'noreply@parsifal.co', ['recipient@gmail.com'])
```