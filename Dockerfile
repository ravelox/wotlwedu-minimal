FROM node:slim as build-stage

WORKDIR /build
COPY . .

RUN npm install

RUN npm install -g @angular/cli

RUN ng build

FROM nginx:alpine-slim


COPY --from=build-stage /build/dist/frontend/browser/ /usr/share/nginx/html/
COPY --from=build-stage /build/nginx-config/ /etc/nginx/templates/

COPY --from=build-stage /build/999-wotlwedu-config.sh /docker-entrypoint.d/
RUN chmod a+x /docker-entrypoint.d/999-wotlwedu-config.sh

EXPOSE 80
EXPOSE 443
