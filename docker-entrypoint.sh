#!/bin/bash -x

#
# Environment variable replacement for API URL
#
if [ -z "${WOTLWEDU_API_URL}" ]
then
   echo "WOTLWEDU_API_URL must be set"
   exit 1
fi

cd /var/opt/wotlwedu-minimal

envsubst < src/app/global.ts > src/app/global.ts.tmp && mv src/app/global.ts.tmp src/app/global.ts
ng build --configuration=production

cp -Rvp dist/frontend/browser/* /var/www/html/

exec apachectl -DFOREGROUND