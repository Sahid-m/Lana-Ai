# How to setup

1. Run Database Docker, migrate and generate clients.

```
 docker run -p 5432:5432 -d -e POSTGRES_PASSWORD=mysupersecretpassword postgres
```

2. BUILD NEW CODER SERVER DOCKER FILE

```
sudo docker build -f docker/dockerfile.newcoder -t code-server-new .
```

3. RUN THE IMAGE

```
sudo docker run -it --add-host=host.docker.internal:host-gateway  -p 8080:8080 new-code-server
```

4. RUN THE APPS
