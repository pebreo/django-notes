Overview
---------
Braintree is a payment service owned by Ebay.
#### The transaction flow using braintree
The steps for a payment to take play are:
1. Your client sends request to your server
2. Your server gives the client a client token
3. The client uses the token to get a payment method nonce from Braintree server
4. Then your client gives payment method nonce to your server
5. Our server gives the nonce to Braintree server to allow it to submit a payment
#### Terms
* `nonce` is kind of like a token that can only be used once
* `token` is like a replacement for user/password pair

INSTALLATION
-----------
```
pip install braintree
```

SETUP
-----
#### Connect to braintree by passing `merchant_id`, `public_key`, and `private_key`
Call a class method
```
import braintree

braintree.Configuration.configure(braintree.Environment.Sandbox,
                                  merchant_id="use_your_merchant_id",
                                  public_key="use_your_public_key",
                                  private_key="use_your_private_key")
```
#### Create a client token
"Your server is responsible for generating a client token, 
which contains all authorization and configuration information 
your client needs to communicate with Braintree. 
Including a customerId when generating the client token lets 
returning customers select from previously used payment method options, 
improving user experience over multiple checkouts."
```python
@app.route("/client_token", methods=["GET"])
def client_token():
  return braintree.ClientToken.generate()
```

TRANSACTIONS
-------------
A nonce is a one-time-use token. In this case,
a nonce is created by the client and passed to the server-side
so that the server can handle the type of payment.
#### Get a **nonce* token from client-side and use it on your server
```python
@app.route("/checkout", methods=["POST"])
def create_purchase():
  nonce_from_the_client = request.form["payment_method_nonce"]
  # Use payment method nonce here...
```
#### Run a transaction
```python
result = braintree.Transaction.sale({
    "amount": "10.00",
    "payment_method_nonce": nonce_from_the_client,
    "options": {
      "submit_for_settlement": True
    }
})
```

RECORDING TRANSACTIONS
----------------------
