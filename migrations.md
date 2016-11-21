

Migrations
---------- 
Whenever we change the `models.py` file we need to
run `manage.py makemigrations myapp` so that we can keep track of
our database schema. Please note that destriuctive changes 

The basic process for migrations (>= Django 1.7) is:
* Step 1. Create/change the `models.py` file
* Step 2. Make migrations files with `manage.py makemigrations myapp`
* Step 3. Optional: preview migration files `managae.py <appname> <migration_name>
* Step 4. Apply migrations: `./manage.py migrate`

### If you're upgrading from South
If you're starting from scratch, you should delete all South migration files
and start over. After you delete the South migration files just do
```
./manage.py makemigrations
./manage.py migrate
```
#### If you already have a database
```
./manage.py migrate --fake-initial <appname>
```

```
# show migrations
./manage.py migrate --list

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