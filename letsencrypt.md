
Overview
--------
Let's Encrypt is a free HTTPS signing service.

SSL makes it safer for users to login with their plaintext passwords.
Nginx needs both a certificate and a key that is signed by an authority,
in this case, our authority is letsencrypt which gives us both the cert and the key.

Nginx basic SSL script examples
-----------------------------
```
server {

      # [...]

      listen 443; # the https port
      ssl on; 
      ssl_certificate      /srv/ssl/nginx.pem;
      ssl_certificate_key  /srv/ssl/nginx.key;  

      # [...]
}
```
source: https://www.linode.com/docs/security/ssl/provide-encrypted-resource-access-using-ssl-certificates-on-nginx

Optimizing your nginx for SSL
-----------------------------
```
# nginx.conf

# root of nginx.conf
worker_processes 4;

http {
# ..
  ssl_session_cache shared:SSL:10m;
  ssl_session_timeout 10m;
# ..  
}


server {
#...
  keepalive_timeout 70;
#...  
}
```
source: https://www.linode.com/docs/security/ssl/provide-encrypted-resource-access-using-ssl-certificates-on-nginx

Create signed certificates using Docker Machine and Docker
----------------------------------------------------------
#### Create a machine
```
docker-machine create -d digitalocean \
  --digitalocean-access-token <access_token> \
  letsencrypt

docker-machine ip letsencrypt
```
#### Register Domain name

#### Spin up docker containers
```
deval letsencrypt
docker run -d \
  -p 80:80 \
  --name nginx \
  -v /usr/share/nginx/html \
  nginx

docker run -it \
  --name letsencrypt \
  --volumes-from nginx \
  quay.io/letsencrypt/letsencrypt \
  certonly \
  --agree-tos \
  --webroot \
  --webroot-path /usr/share/nginx/html \
  -m certs@mydomain.acme.com \
  -d mydomain.acme.com
```
#### Copy signed certificate
```
# cp the certs to host
docker cp letsencrypt:/etc/letsencrypt/ letsencrypt
# or
docker cp <containerId>:/file/path/within/container /host/path/target

ls letsencrypt/archive/mydomain.acme.com/


# verify that letsencrypts validation servers hit our domain
docker logs nginx

# cleanup 
docker-machine rm letsencrypt
```

https://thisendout.com/2016/04/21/letsencrypt-certificate-generation-with-docker/