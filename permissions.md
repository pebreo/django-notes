PERMISSIONS/AUTHORIZATION IN DJANGO
-----------------------------------


How to give table-level permission
-----------------------------------
If you want to allow only certain people
to do certain actions on your class/table,
then you can use the built-in django Groups
and customize your model to include
certain permissions for certain actions.



1. Add permissions to the `Meta` of a class (table)
for example:
```python
class BookInstance(models.Model):
    ...
    class Meta:
        ...
        permissions = (("can_mark_returned", "Set book as returned"),)
```

2. Create a group
3. Give the group that permission

4. Create a user
5. Add that user to a group with that particular permission

Alternatively:
4. Create a user
5. Add that specific permission to the user


How to give ownership to a particular user
---------------------------------
Let's say that you wanted to restrict access
to a blogpost to only one person, you
can 
```
class Post(models.Model):
    owner = models.ForeignKey(User)
```

Sources
--------

Putting users in departments and giving permissions
https://spapas.github.io/2013/11/05/django-authoritiy-data/

Tutorial for adding permission to a model - Mozilla
https://developer.mozilla.org/en-US/docs/Learn/Server-side/Django/Authentication