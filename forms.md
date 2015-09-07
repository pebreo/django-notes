
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









