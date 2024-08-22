FROM httpd:2.4

COPY dist/frontend/browser/  /usr/local/apache2/htdocs/

RUN apt-get update && apt-get install -y procps && rm -rf /var/lib/apt/lists/*

EXPOSE 80
