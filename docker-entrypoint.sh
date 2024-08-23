#!/bin/bash -x

# Check that required env variables are set
while read var; do
  [ -z "${!var}" ] && { echo "$var is empty or not set."; exit 1; }
done << EOF
WOTLWEDU_API_URL
WOTLWEDU_SERVER_NAME
WOTLWEDU_SSL_CERT_FILE
WOTLWEDU_SSL_KEY_FILE
EOF

cd /var/opt/wotlwedu-minimal

envsubst < src/app/global.ts > src/app/global.ts.tmp && mv src/app/global.ts.tmp src/app/global.ts
ng build --configuration=production

cp -Rvp dist/frontend/browser/* /var/www/html/

exec apachectl -DFOREGROUND