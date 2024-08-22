FROM httpd:2.4

COPY dist/frontend/browser/  /usr/local/apache2/htdocs/
COPY apache-config/default-ssl.conf /usr/local/apache2/conf/extra/httpd-ssl.conf
COPY apache-config/httpd.conf /usr/local/apache2/conf/httpd.conf

RUN apt-get update && apt-get install -y procps && rm -rf /var/lib/apt/lists/*

EXPOSE 80
EXPOSE 443
