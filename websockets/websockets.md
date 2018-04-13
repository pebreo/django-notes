### consumers - abridged

On the server side, the `message` object is passed to the consumer
which will handle the websocket message. The message object has a
special `reply_channel` that is the name of the socket which
that message was sent. For example `ws://foo.com/users` is a certain
channel and has a certain socket instance associated with it.
```python
# routing.py
from . import consumers

channel_routing = {
    'websocket.connect': consumers.ws_connect,
    'websocket.receive': consumers.ws_receive,
    'websocket.disconnect': consumers.ws_disconnect,
}

# consumers.py
@channel_session_user_from_http
def ws_connect(message):
    # ..
    Group('users').send({
        'text': json.dumps({
            'username': message.user.username,
            'is_logged_in': True
        })
    })


@channel_session_user
def ws_disconnect(message):
    ...
```

### client - abridged
```javascript
<script>
var socket = new WebSocket('ws://' + window.location.host + '/users/');

socket.onopen = function open() {
    console.log('WebSockets connection created.');
};

socket.onmessage = function message(event) {
    var data = JSON.parse(event.data);
    console.log(data);
}
</script>
```

### server - complete code
```python


```

### client - complete code
```javascript

```



## Resources

https://channels.readthedocs.io/en/latest/tutorial/part_2.html

https://realpython.com/getting-started-with-django-channels/

https://blog.heroku.com/in_deep_with_django_channels_the_future_of_real_time_apps_in_django