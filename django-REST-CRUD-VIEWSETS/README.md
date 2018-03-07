# CRUD operation checklist
* `serializers.py`
* `views.py`
* `myproj/urls.py`

Example usage using CURL
```
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser --email admin@example.com --username admin
$ curl -H 'Accept: application/json; indent=4' -u admin:password123 http://127.0.0.1:8000/users/
{

# or goto browser
http://127.0.0.1:8000/users/
```
