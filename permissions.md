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

Row-level (object-level) permissions with Guardian
------------------------------
By default, Django does not allow you to assign
permission from one object to another. For example,
you could not assign a certain permission for 
a particular User for a particular task defined 
like this:
```
class Task(models.Model):
    name = models.CharField()
    done = models.Boolean(default=True)
    class Meta:
        permissions = (
            ('view_task', 'View task')
        )
```
So, if you were to try something like this
then you'd fail:
```
joe = User.objects.create(name='Joe')
task = Task.objects.create(name='swim')
joe.has_perm('view_task', task)
False
```
But with `django-guardian` you could
assign object pairs permissions.
```
from guardian.shortcuts import assign_perm
assign_perm('view_task', joe, task)
joe.has_perm('view_task', task)
True
```

Class-level permissions with Guardian
-----------------------------------
```
from guardian.shortcuts import assign_perm

mygroup = Group.objects.create(name='employees')
task = Task.objects.create(name='sleep')
assign_perm('view_task', mygroup, task)
joe.has_perm('view_task', task)
False

# add joe to employees group
joe.groups.add(group)
joe.has_perm('view_task', task)
True
```



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

django guardian - assigning tasks
http://django-guardian.readthedocs.io/en/stable/userguide/assign.html

Putting users in departments and giving permissions
https://spapas.github.io/2013/11/05/django-authoritiy-data/

Tutorial for adding permission to a model - Mozilla
https://developer.mozilla.org/en-US/docs/Learn/Server-side/Django/Authentication