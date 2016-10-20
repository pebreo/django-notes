

settings.py
----------
```python

########## LOGGING CONFIGURATION
# See: https://docs.djangoproject.com/en/dev/ref/settings/#logging
# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error when DEBUG=False.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'standard': {
            'format' : "[%(asctime)s] %(levelname)s [%(name)s:%(lineno)s] %(message)s",
            'datefmt' : "%d/%b/%Y %H:%M:%S"
        },
        'simple': {
            #'()': 'djangocolors_formatter.DjangoColorsFormatter', # colored output
            'format': '%(levelname)s %(name)s %(filename)s@%(lineno)s: %(message)s'
        },
    },
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        }
    },
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler',
            'formatter': 'standard',
        },
        'console':{
            'level': 'DEBUG',
            'class':'logging.StreamHandler',
            'formatter': 'simple',
        },
        'syslog': {
            'level':'INFO',
            'class':'logging.handlers.SysLogHandler',
            'address': '/dev/log',
        },
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
        'huey.consumer': {
            'handlers': ['syslog'],
            'level': 'INFO',
            'propagate': True,
       },
    }

```

usage
-----
```python

import logging
import sys
logging.basicConfig(stream=sys.stdout, level=logging.DEBUG)

logging.debug('hello world')

```

