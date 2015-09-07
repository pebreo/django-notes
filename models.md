
Model Admin customization
-------------------------
```python
#admin.py
from django.db import models


class Post(models.Model):
    title = models.CharField('title', max_length=64)
    slug = models.SlugField(max_length=64)
    content = models.TextField('content')
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        permissions = (
            ('view_post', 'Can view post'),
        )
        get_latest_by = 'created_at'

    def __unicode__(self):
        return self.title

    @models.permalink
    def get_absolute_url(self):
        return {'post_slug': self.slug}
        
    def save(self, *args, **kwargs):
        """Save model and start a celery task"""
        super(Post, self).save(*args, **kwargs)
        # do other stuff here like schedule a celery task or something
```






```

ForeignKey vs ManyToMany Examples
------------------------------
```python
from django.db import models

 # manufacturer
 class Manufacturer(models.Model):
    name = models.CharField(blank=True, max_length=255)
# car - use foreignkey because a car only has one manufacturer
class Car(models.Model):
    name = models.CharField(blank=True, max_length=255)
    manufacturer = models.ForeignKey(Manufacturer, related_name='cars')
'''
from myapp.models import *
toyota = Manufacturer(name='toyota')
toyota.save()

corolla = Car(name='corolla', manufacturer=toyota)
corolla.save()

Manufacturer.objects.get(name='toyota').cars.all()
'''
# ==========================================================================
# recipe
class Recipe(models.Model):
    name = models.CharField(blank=True, max_length=255)
# ingredient
# use manytomany because if you delete an ingredient it won't delete the recipe
class Ingredient(models.Model):
    name = models.CharField(blank=True, max_length=255)
    # a recipe has many ingredient
    recipe = models.ManyToManyField(Recipe, related_name='ingredients')
'''
pancakes = Recipe(name='pancakes')
pancakes.save()
eggs = Ingredient(name='eggs')
eggs.save()
eggs.recipe.add(pancakes)
eggs.save()
flour = Ingredient(name='flour')
flour.save()
flour.recipe.add(pancakes)
'''
```



ModelAdmin and Inlines
--------------------
Example model
```python
from django.db import models
from django.contrib import admin

class Topic(models.Model):
    title = models.CharField(max_length=20)
    time = models.DateTimeField(auto_now_add=True)
    
    def __unicode__(self):
        return self.title

    class Meta:
        ordering = ['-time']

class Lesson(models.Model):
    title = models.CharField(max_length=20)
    time = models.DateTimeField(auto_now_add=True)
    slug =  models.SlugField()
    content = models.TextField
    
    # NOTE: A Topic has many lessons so we put that foreign key in Lessons, we don't create a ForeignKey in Topic
    # Topic.objects.filter(lessons__title__iname='foo')
    # or, if there was no 'related_name' Topic.lesson_set.all()
    # or Topic.lessons.all()
    topic = models.ForeignKey(Topic, related_name='lessons')
    
    def __unicode__(self):
        return self.title

    class Meta:
        ordering = ['-time']

class LessonInlineAdmin (admin.TabularInline):
    """Inline configuration for Django's admin on the Lesson model."""
    model = Lesson
    extra = 8
    def get_extra (self, request, obj=None, **kwargs):
        """Dynamically sets the number of extra forms. 0 if the related object
        already exists or the extra configuration otherwise."""
        if obj:
            # Don't add any extra forms if the related object already exists.
            return 0
        return self.extra


class TopicAdmin (admin.ModelAdmin):
    """Configuration for Django's admin on the Topic model."""
    inlines = [ LessonInlineAdmin ]


admin.site.register(Topic, TopicAdmin)
#admin.site.register(Lesson, Lesson)

```

Modeladmin - better formatting
-------------------------------
```python

# screenshot: https://dl.dropboxusercontent.com/s/5yg9wc752gbpqev/__django-meta-and-modeladmin.png?dl=0
# models.py
class SuperHero(models.Model):
    name = models.CharField(max_length=100)
    added_on = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return "{} - {1:%Y-%m-%d %H:%M:%S}".format(self.name, self.added_on)
        
    def get_absolute_url(self):
        return reverse('superhero.views.details', args=[self.id])
    
    class Meta:
        ordering = ["-added_on"]
        verbose_name = "superhero"
        verbose_name_plural = "superheroes"

# admin.py
class SuperHero(admin.ModelAdmin):
    list_display = ('name', 'added_on')
    search_fields = ["name"]
    ordering = ["name"]
```

User Profile w/ Userena
----------------------
"If you would like to include other attributes than what is provided by the User model, then you will needed to create a model that is associated with the the User model."

```python
from django.db import models
from django.contrib.auth.models import User
from django.utils.translation import ugettext as _
from userena.models import UserenaBaseProfile

class UserProfile(UserenaBaseProfile):
    user = models.OneToOneField(User,
                                unique=True,
                                verbose_name=_('user'),
                                related_name='my_profile')
    favourite_snack = models.CharField(_('favourite snack'),
                                       max_length=5)
    customer_ID = models.CharField(max_length=255,blank=True,null=True)
    
    # Override the __unicode__() method to return out something meaningful!
    def __unicode__(self):
        return self.user.username
        

u = User.objects.filter(username='test1')[0]

u = User.objects.get(username='test1')

MyProfile.objects.all()

MyProfile.objects.select_related()

MyProfile.objects.get(user__username='test1')
```

Twitter clone
------------
```python
# models.py

from django.db import models
from django.contrib.auth.models import User
from django.contrib import admin
from django.core.exceptions import ObjectDoesNotExist

class ProfileManager(models.Manager):
    def get_followers(self, username):
        try:
            return Profile.objects.get(user__username=username).followers.all()
        except ObjectDoesNotExist:
            pass
        return None

class Profile(models.Model):
    user = models.OneToOneField(User)
    objects = ProfileManager()

    def __unicode__(self):
        return self.user.username

class Follower(models.Model):
    user = models.OneToOneField(User)
    # a profile has many followers
    profile = models.ManyToManyField(Profile, related_name='followers')

    def __unicode__(self):
        return "follower: %s" % self.user.username

class ProfileAdmin(admin.ModelAdmin):
    pass

class FollowerAdmin(admin.ModelAdmin):
    pass

admin.site.register(Profile, ProfileAdmin)
admin.site.register(Follower, FollowerAdmin)

'''
from myapp.models import *
from django.contrib.auth.models import User

# create user and profile
u1 = User(username='userAlpha')
u1.save()
prof1 = Profile(user=u1)
prof1.save()

# create follower
u9 = User(username='follower1')
u9.save()

f1 = Follower(user=u9)
f1.save()
f1.profile.add(prof1)

# get all followers
 Profile.objects.get(id=1).follower_set.all()
 or, Profile.objects.get(id=1).followers.all()
 or, Profile.object.get_followers(username='myusername')

# get all people you are following
f1.profile.all()
```


Django ORM Queries
-----------------
```python
'''
ManyToMany vs ForeignKey

If each car has one manufacturer, then you should use a foreign key from Car to Manufacturer. 
This will allow multiple cars to have the same manufacturer, 
and manufacturers will not be deleted when cars are deleted. 
A many to many field suggests that one car can have multiple manufacturers.

source: http://stackoverflow.com/questions/8872030/confused-about-django-foreignkey-manytomanyfield-inlineformset-factories
'''
# give these models
from django.db import models

class Blog(models.Model):
    name = models.CharField(max_length=100)
    tagline = models.TextField()

    def __unicode__(self):              # __str__ on Python 3
        return self.name

class Author(models.Model):
    name = models.CharField(max_length=50)
    email = models.EmailField()

    def __unicode__(self):              # __str__ on Python 3
        return self.name

class Entry(models.Model):
    blog = models.ForeignKey(Blog)
    authors = models.ManyToManyField(Author)
    body_text = models.TextField()
    pub_date = models.DateField()

    def __unicode__(self):              # __str__ on Python 3
        return self.headline
        
        
# CREATE
from blog.models import Blog

b = Blog(name='Beatles Blog', tagline='All the latest Beatles news.')
b.save()

# saving for 'ForeignKey' relationships
from blog.models import Entry
entry = Entry.objects.get(pk=1)
cheese_blog = Blog.objects.get(name="Cheddar Talk")
entry.blog = cheese_blog
entry.save()

# saving for 'ManyToManyField' relationships
from blog.models import Author
joe = Author.objects.create(name="Joe")
entry.authors.add(joe)

john =  Author.objects.create(name="John")
paul =  Author.objects.create(name="Paul")
entry.authors.add(john, paul)

# UPDATE
b.name = 'New name'
b.save()

# GET
Entry.objects.get(id=1) 
Entry.objects.get(id__exact=1) # same as above
Entry.objects.get(pk=1)  # same as above
Entry.objects.filter(id=1)[0] # same as above

# FILTER

Entry.objects.filter(pub_date__year=2006) 
# same as
Entry.objects.all().filter(pub_date__year=2006)
Entry.objects.filter(pub_date__lte='2006-01-01') # sql: SELECT * FROM blog_entry WHERE pub_date <= '2006-01-01';

# iexact
Blog.objects.get(name__iexact="beatles blog")
# contains
Entry.objects.get(headline__contains='Lennon')

# chaining
Entry.objects.filter(headline__startswith='What')
             .exclude(pub_date__gte=datetime.date.today())
             .filter(pub_date__gte=datetime(2005, 1, 30))

# first entry
Entry.objects.order_by('headline')[0]
# same as
Entry.objects.order_by('headline')[0:1].get()

# filtering relationships
Entry.objects.filter(blog__name='Beatles Blog')
Blog.objects.filter(entry__headline__contains='Lennon')
Blog.objects.filter(entry__authors__name='Lennon')

Blog.objects.filter(entry__headline__contains='Lennon',
        entry__pub_date__year=2008)
        
Blog.objects.filter(entry__headline__contains='Lennon')
            .filter(entry__pub_date__year=2008)
        
# DELETE
b.delete()
```

Django ORM query examples
---------------------
```python

# show duplicate values 

import collections
L = Entry.objects.values_list('slug')
slugs_duplicates = [x for x, y in collections.Counter(L).items() if y > 1]
pks_of_duplicates = Entry.objects.filter(slug__in=slugs_with_duplicates).values_list('pk')

```

