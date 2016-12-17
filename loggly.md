Overview
-------
Loggly is a remote service that makes it easier to monitor
your logs.

You can check out other logging and monitoring services such as
* sysdig
* datadog
* etc

#### Loggly service in `docker-compose.yml` file
```yaml
loggly:
  container_name: loggly-docker
  environment:
    TOKEN: abc123
    TAG: Docker
  tty: true 
  image: sendgridlabs/loggly-docker
  ports:
   - "514:514/udp"

# you must link loggly to the services you want to log
web:
  ...
  links:
    - redis:redis
    - memcached:memcached
    - loggly:loggly

```