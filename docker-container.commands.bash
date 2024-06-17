# CREATE AND RUN RABBITMQ CONTAINER
$ docker run -d --name some-rabbit -p PORT:PORT -p INTERFACE_PORT:INTERFACE_PORT -e RABBITMQ_DEFAULT_USER=user -e RABBITMQ_DEFAULT_PASS=password rabbitmq:3-management

# SOLVING ERROR: [permission denied while trying to connect to the Docker daemon socket at unix]
$ sudo chmod 666 /var/run/docker.sock