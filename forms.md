
django forms notes
----------------
```html

// ideally, you should haven to pass arguments to the view, but instead use hidden field values and grab with POST.get()
<form method="POST" action="{% url 'create_comment' %}">
// if your view needs arguments
<form method="POST" action="{% url 'create_comment' arg1=1 arg2=comment.foo %}">

<input type="hidden" id="parent_id" value="{{comment.parent_id}}">
<input type="hidden" id="comment_id" value="{{comment.id}}">

# in the view
request.POST.get('parent_id') 
request.POST.get('comment_id')
```


CBV forms
----------
```
# reference: https://ccbv.co.uk/projects/Django/1.8/django.views.generic.edit/FormView/

# forms.py
class MyForm(forms.Form):
    name = forms.ChairField(max_length=100)
    age = forms.IntegerField()

# views.py
class MyView(generic.View):
    template_name = 'form.html'
    
    def get(self, request):
      form = MyForm()
      return render(request, self.template_name, {'form':form})
      
    def post(self, request):
        form = MyForm(request.POST)
        if form.is_valid():
            # do stuff with form.cleaned_data['baz']
        else:
            return render(request, self.template_name, {'form':form})

# the shorter way
class MyFormView(generic.View):

    def form_invalid(form):
        # do stuff with form.cleaned_data['bar']
        super().form_invalid(form)

    def form_valid(self, form):
         # do stuff with form.cleaned_data['baz']
         super().form_valid(form)

# the django restframework way?


# urls.py
from .views import MyView
url(r'^myurl/', MyView.as_view(), name='myview')

```    
            

crispy forms
--------
```
install

# forms.py

# form.html
<form class="form" method="POST" action="{{action_url}}">
{% crispy form %}
</form>
```









