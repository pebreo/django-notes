Search approach 1
-------
```python

BELOW IS CODE FOR A HYPOTHETICAL SEARCH APP FOR A HYPOTHETICAL BLOG

# forms.py

from django import forms
TOPIC_CHOICES = ((1,'topic1'),(2,'topic2'),(3,'topic3'))
class SearchForm(forms.Form):
    '''
    Form to search based on blog text and topic
    '''
    blog_text = forms.CharField(required=False,label='BLOG TEXT')
    # a dropdown 
    topic = forms.ChoiceField(required=False,widget=forms.Select,choices=TOPIC_CHOICES)
    
# views.py
from django.shortcuts import render, redirect
from django.core.urlresolvers import reverse
from django.views.generic import TemplateView
from django.db.models import Q

from .forms import SearchForm
from .models import Blog

class SearchFormView(TemplateView):
    '''
    Render the form
    '''
    template_name = 'myapp/searchform.html'
    def get_context_data(self, **kwargs):
        context = super(SearchView, self).get_context_data(**kwargs)
        form = SearchForm()
        context.update({'form':form})
        return context

def mysearch(request, template_name='search_results.html'):
    '''
    Run a sequence of filters using Q objects
    '''
    if request.method == 'POST':
        form = SearchForm(request.POST)
        if form.is_valid():
            entries = Blog.objects.all()
            if form.cleaned_data['blog_text'] != '':
                q = Q(entry__icontains=form.cleaned_data['blog_text'])
                entries = entries.filter(q)
            if form.cleaned_data['category'] != '':
                q = Q(category__exact=form.cleaned_data['category'])
                entries = entries.filter(q)
            return render(request, template_name, {'object_list':entries})
    
    return redirect(reverse('searchform_view'))
    
# searchform.html 
<html>
<form id="search" action="post" action="{% url 'searchresult_view' %}"> 
{{form.as_ul}}
  <input type="submit" value="Pay $25">
 </form>
</html>

# searchresults.html 
<html>
{% for r in object_list %}
{{r.title}}
{{r.date_published}}
{% endfor %}
</html>

# app/urls.py
from django.conf.urls import *
from .views import SearchFormView, mysearch

urlpatterns = patterns('',
    url(r'search/',SearchView.as_view(), name="searchform_view"),
    url(r'searchresult/', mysearch, name="searchresult_view"),
)
````

Search approach 2
-----------------
```python

EVERYTHING IS THE SAME AS ABOVE EXCEPT THE SEARCH VIEW
from django.shortcuts import render, redirect
from django.core.urlresolvers import reverse
from django.views.generic import TemplateView
from django.db.models import Q

from .forms import SearchForm
from .models import Blog
import operator

def searchresult_view(request,template_name='myapp/searchresults.html'):
    if request.method == 'POST':
        form = SearchForm(request.POST)
        if form.is_valid():
            predicates = [('entry__icontains', 'entry'), ('category__exact', 'category')]
            q_list = [Q(p) for p in predicates]
            final_Q = reduce(operator.and_, q_list)
            
            entries = Blog.objects.filter(final_Q)
            return render(request, template_name, {'object_list':entries})
            
    return redirect(reverse('searchform_view'))


```

