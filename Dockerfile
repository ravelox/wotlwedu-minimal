FROM ubuntu:latest

WORKDIR /var/opt/wotlwedu-minimal
COPY . .

RUN apt-get update && \
    apt-get -y install apache2 vim procps lsof gettext curl gnupg && \
    rm -rf /var/lib/apt/lists/*
RUN a2enmod ssl rewrite

RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
RUN apt-get install -y nodejs
    
RUN npm install -g @angular/cli
RUN npm install
    
RUN node -v
RUN npm -v
RUN ng version

COPY apache-config/wotlwedu*.conf /etc/apache2/sites-available/
RUN a2ensite wotlwedu wotlwedu-ssl

EXPOSE 80
EXPOSE 443

RUN chmod a+x /var/opt/wotlwedu-minimal/docker-entrypoint.sh
CMD ["/var/opt/wotlwedu-minimal/docker-entrypoint.sh"]