FROM nginx:latest

COPY dist/frontend/browser/ /usr/share/nginx/html/
COPY nginx-config/ /etc/nginx/templates/

EXPOSE 80
EXPOSE 443
