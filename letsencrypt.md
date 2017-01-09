
Overview
--------
Let's Encrypt is a free HTTPS signing service.

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
ls letsencrypt/archive/mydomain.acme.com/


# verify that letsencrypts validation servers hit our domain
docker logs nginx

# cleanup 
docker-machine rm letsencrypt
```

https://thisendout.com/2016/04/21/letsencrypt-certificate-generation-with-docker/