

Migrations
--------
```
# show migrations
./manage.py migrate --list

# For Django>=1.7
# If you didn't change your model
./manage.py migrate

# If you changed your model
./manage.py makemigrations
./manage.py migrate

# For Django<=1.6
# If you changed your model
./manage.py schemamigration myapp --initial
./manage.py migrate myapp

# If you don't have any old data
./manage.py syncdb --all
./manage.py migrate --fake 


# Specify which migration to use: South or Django built-in migrations
MIGRATION_MODULES = [
    'aldryn_people': 'aldryn_people.south_migrations',
    # or
    'aldryn_people': 'aldryn_people.django_migrations',
]

# what if data already exists and it complains of unmigrated migrations?
./manage.py migrate --list
./manage.py migrate --fake

# in south
./manage.py migrate --all --fake

```