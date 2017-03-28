
You usually encounter OAuth2 when you need to make
an app that allows your user to login using their
social media accounts (e.g. Facebook, Twitter, etc).

OAuth2 is the standard protocol for 3rd party authentication.
The parties involved are:
- The User - this is your user/user's browser
- The Client - this is usually your server
- The Server - this is the 3rd party server e.g. Facebook


The following is the general steps for how OAuth2 works:

1. User tells client

2. Client redirects user to login to server w/callback URL

3. User logs into server

4. Server gives auth code to client

5. Client gives auth code + auth key to server

6. Server gives token to client. Now client has
access to server data using that token.


source: Zapi API Tutorial