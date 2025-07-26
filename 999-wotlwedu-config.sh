#!/bin/sh
# vim:sw=4:ts=4:et

set -e

entrypoint_log() {
    if [ -z "${NGINX_ENTRYPOINT_QUIET_LOGS:-}" ]; then
        echo "$@"
    fi
}

ME=$(basename "$0")
NGINX_ROOT=/usr/share/nginx/html

entrypoint_log "$ME: WOTLWEDU_API_URL=${WOTLWEDU_API_URL}"

envsubst < ${NGINX_ROOT}/assets/wotlwedu-config.json.template > ${NGINX_ROOT}/assets/wotlwedu-config.json && rm ${NGINX_ROOT}/assets/wotlwedu-config.json.template

entrypoint_log "$ME: info: Created Wotlwedu configuration file"

exit 0
