To run host the project root on a webserver.

I've used a docker nginx container as webserver.

With docker up and running run

    docker pull nginx
    docker run --name inf351 -v windows-path-to-project:/usr/share/nginx/html:ro -d -p 8080:80 nginx

Then visit

    http://localhost:8080
