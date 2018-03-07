# CRUD operation checklist
* `serializers.py`
* `views.py`
* `myproj/urls.py`

## `requirements.txt`
```
django>=1.8,<1.9
djangorestframework==3.5.4
djangorestframework-jwt==1.11.0
```

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
