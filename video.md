Overview
-------
Make sure you

* Create an S3 bucket (see S3.md for details)
* Install django-storages
* Setup you `settings.py`
* Use `FileField` and `upload_to` 
* Customize your S3 policy to only allow from certain domains/ip addresses:
```json
{
"Version": "2008-10-17",
"Id": "Restrict based on HTTP referrer policy",
"Statement": [
    {
        "Sid": "1",
        "Effect": "Deny",
        "Principal": {
            "AWS": "*"
        },
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::mybucket/myprefix/*",
        "Condition": {
            "StringNotLike": {
                "aws:Referer": [
                    "http://www.mydomain.com/*",
                    "http://www.subdomain.mydomain.com/*"
                ]
            }
        }
    }
]
}
```

Other resources
-----------

http://stackoverflow.com/questions/10390244/how-to-set-up-a-django-project-with-django-storages-and-amazon-s3-but-with-diff

http://stackoverflow.com/questions/14471661/restrict-s3-object-access-to-requests-from-a-specific-domain

http://s3browser.com/working-with-amazon-s3-bucket-policies.php



