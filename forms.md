
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
```python
# reference: https://ccbv.co.uk/projects/Django/1.8/django.views.generic.edit/FormView/

# forms.py
class MyForm(forms.Form):
    name = forms.ChairField(max_length=100)
    age = forms.IntegerField()

# views.py
class MyView(generic.View):
    template_name = 'form.html'
    success_url = '/success'
    
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


CRUD operations using CBV
---------------------
```python

# models.py
class MyMod(models.Model):
    name = models.CharField(max_length=255)
    date_of_birth = models.DateField() 
    def __str__(self):
        return self.name

# forms.py
from django import forms
from . import models
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Submit

class MyModForm(forms.ModelForm):
    class Meta:
        model = models.MyMod
        fields = ['name', 'date_of_birth']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        self.helper = FormHelper(self)
        self.helper.layout.append(Submit('save','Save')
        
# views
from django.utils.decorators import method_decorator
from django.cor.urlresolvers import reverse_lazy

from . import forms

class MyModDetail(generic.UpdateView):
    model = MyMod
    form_class = forms.MyForm
    
class MyModCreate(generic.UpdateView):
    model = MyMod
    form_class = forms.MyForm
    template_name = 'foo/bar.html'
    
    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super(MyModCreate, self).dispatch(*args, **kwargs)
    
    def form_valid(self, form):
        send_activation_email(self.request.user)
        text = form.cleaned_data['text']
        user = self.request.user
        Post.objects.create(user=user, text=text)
        messages.success(self.request, "Success",extra_tags='alert-success')
        return HttpResponseRedirect(self.request.get_full_path())

class MyModUpdate(generic.UpdateView):
    model = MyMod
    form_class = forms.MyForm

class MyModDelete(generic.DeleteView):
    model = MyMod
    success_url = reverse('mymod_list_view')

# urls.py
url(r'^myurl/create', MyModCreate.as_view(), name='mymod_create')
url(r'^myurl/(?P<pk>)', MyModDetail.as_view(), name='mymod_detail')
url(r'^myurl/(?P<pk>)/update', MyModUpdate.as_view(), name='mymod_update')
url(r'^myurl/(?<pk>)/delete', MyModDelete.as_view(), name='mymod_delete')

# template.html
{% load crispy_form_tags %}
{{ crispy form }}

```

crispy forms example
------------------
```python
install

# forms.py
from django import forms

from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Div, Submit, HTML, Button, Row, Field
from crispy_forms.bootstrap import AppendedText, PrependedText, FormActions


class MessageForm(forms.Form):
    text_input = forms.CharField()

    textarea = forms.CharField(
        widget = forms.Textarea(),
    )

    radio_buttons = forms.ChoiceField(
        choices = (
            ('option_one', "Option one is this and that be sure to include why it's great"), 
            ('option_two', "Option two can is something else and selecting it will deselect option one")
        ),
        widget = forms.RadioSelect,
        initial = 'option_two',
    )

    checkboxes = forms.MultipleChoiceField(
        choices = (
            ('option_one', "Option one is this and that be sure to include why it's great"), 
            ('option_two', 'Option two can also be checked and included in form results'),
            ('option_three', 'Option three can yes, you guessed it also be checked and included in form results')
        ),
        initial = 'option_one',
        widget = forms.CheckboxSelectMultiple,
        help_text = "<strong>Note:</strong> Labels surround all the options for much larger click areas and a more usable form.",
    )

    appended_text = forms.CharField(
        help_text = "Here's more help text"
    )

    prepended_text = forms.CharField()

    prepended_text_two = forms.CharField()

    multicolon_select = forms.MultipleChoiceField(
        choices = (('1', '1'), ('2', '2'), ('3', '3'), ('4', '4'), ('5', '5')),
    )

    # Uni-form
    helper = FormHelper()
    helper.form_class = 'form-horizontal'
    helper.layout = Layout(
        Field('text_input', css_class='input-xlarge'),
        Field('textarea', rows="3", css_class='input-xlarge'),
        'radio_buttons',
        Field('checkboxes', style="background: #FAFAFA; padding: 10px;"),
        AppendedText('appended_text', '.00'),
        PrependedText('prepended_text', '<input type="checkbox" checked="checked" value="" id="" name="">', active=True),
        PrependedText('prepended_text_two', '@'),
        'multicolon_select',
        FormActions(
            Submit('save_changes', 'Save changes', css_class="btn-primary"),
            Submit('cancel', 'Cancel'),
        )
    )

# 


# form.html
<form class="form" method="POST" action="{{action_url}}">
{% crispy form %}
</form>
```









