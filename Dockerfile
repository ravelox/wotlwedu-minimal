FROM ubuntu:latest

RUN apt-get update && apt-get -y install apache2 vim procps lsof
RUN a2enmod ssl rewrite

#
# Copy the app to the HTML director
#
COPY dist/frontend/browser/ /var/www/html/
COPY apache-config/wotlwedu-ssl.conf /etc/apache2/sites-available/

#
# Enable the app SSL site
#
RUN a2ensite wotlwedu-ssl

EXPOSE 80
EXPOSE 443

CMD ["apachectl","-D","FOREGROUND"]