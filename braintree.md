Overview
---------
See this chart : https://developers.braintreepayments.com/start/hello-server/python

Braintree is a payment service owned by Ebay.
#### The transaction flow using braintree
The steps for a payment to take play are:
1. Your client sends request to your server
2. Your server gives the client a client token
3. The client uses the token to get a payment method nonce from Braintree server
4. Then your client gives payment method nonce to your server
5. Our server gives the nonce to Braintree server to allow it to submit a payment

See here for a nice diagram: https://developers.braintreepayments.com/start/overview

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



Braintree API notes
-------------------


### Testing the card
The sandbox website: https://sandbox.braintreegateway.com

Use the Visa card number : 4111111111111111

Invalid Visa card: 4000111111111115

Other test card numbers:
https://developers.braintreepayments.com/reference/general/testing/python

Setup
------
You should install braintree with `pip install braintree`
Then in your views.py you should add this to the top of the file:

```
import braintree
braintree.Configuration.configure(braintree.Environment.Sandbox,
                          merchant_id="xyz123",
                          public_key="defghij109",
                          private_key="eeeeiii")

SUBSCRIPTION_PLAN_ID = 'abc123'
```

Usage
----
First, create a customer
```
customer_result = braintree.Customer.create({})
customer_id = customer_result.customer.id
```

Next, create a payment method

```
nonce = request.POST.get("payment_method_nonce")
payment_result = braintree.PaymentMethod.create({
        "customer_id": customer_id,
        "payment_method_nonce": nonce,
        "options": {"make_default": True},
    })
```

Finally, create a subscription
```
payment_token = payment_result.payment_method.token
subscription_result = braintree.Subscription({
        "pay_method_token": payment_token,
        "plan_id": SUBSCRIPTION_PLAN_ID
    })
```

Here are some common properties you can get 
from the different results:
```
# payment types: 'paypal_account', 'credit_card'
payment_type = subscription_result.subscription.transactions[0].payment_instrument_type
transaction_id = subscription_result.subscription.transactions[0].id
subscription_id = subscription_result.subscription.id
subscription_amount = subscription_result.subscription.price
```

How does your braintree payment view work?
-----------------------------------------
* Start at upgrade() which passes context which contains the client token associated with a client_id
* On the frontend, we use the braintree javascript rendered form (which is bootstrap responsive)
* Also, the braintree form already comes with input validation built in
* When a user submits the form, they are directed to upgrade_view_formpost()
* It makes sure that users are user.is_authenticated()
* It calles get_usermerchant_customerid()
* It gets the nonce from the form
* It calls create_subscription(user, nonce) . The nonce is a symbol for the payment that person made
* That function then creates a braintree.PaymentMethod.create(customer_id, payment_method_nonce, options={'makedefault'=True})
* Then that function calls create_subscription_2 (which i have to rename to a better name)
* create_subscription_2(user, merchant_obj, payment_token):
 - checks: do they have a subscription and plan_id associated with this usermerchantobj? 
    - if yes:
       - is their subscription active?
           if yes:
              - raise SubscriptionExistsError
           if no:
              - we have to update their subscription to by doing: braintree.Subscription.update(subscription_id, {'payment_method_token':token})
              - and we sure make sure merchant_obj.user.is_member = True
    - if no, we create a new subscription

* If create_subscription()  is successful, then we call save_subscription_and_plan_info(). (btw, i should rename the first func to create_update_subscription())
* save_subscription_plan_info() records the subscription_id and plan_id to the UserMerchantId instance
* next, we record the transaction on our database and call create_transaction()
* finally, if saving the transaction is success we call update_membership_date() this 
