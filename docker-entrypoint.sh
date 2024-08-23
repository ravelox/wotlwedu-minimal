#!/bin/bash

#
# Environment variable replacement for API URL
#
if[ -z "${WOTLWEDU_API_URL}" ]
then
   echo "WOTLWEDU_API_URL must be set"
   exit 1
fi

cd /var/www/html
for f in main*.js
do
    envsubst < ${f} > tempfile
    mv tempfile ${f}
done

exec apachectl -DFOREGROUND