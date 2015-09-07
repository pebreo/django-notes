
Session data
-----------

```python

request.method == 'GET' 
# or 'POST'

request.session['mycookievar']

request.POST['stripeToken'] # e.g. <input type="hidden" name="stripeToken" />

request.GET['q'] # e.g. /?q=foo

request.user.id # the user id

form.cleaned_data['input_name']

def login(request):
    m = Member.objects.get(username=request.POST['username'])
    if m.password == request.POST['password']:
        request.session['member_id'] = m.id
        return HttpResponse("You're logged in.")
    else:
        return HttpResponse("Your username and password didn't match.")

# cookies        
def login(request):
    if request.method == 'POST':
        if request.session.test_cookie_worked():
            request.session.delete_test_cookie()
            return HttpResponse("You're logged in.")
        else:
            return HttpResponse("Please enable cookies and try again.")
        request.session.set_test_cookie()
    return render_to_response('foo/login_form.html')
```
