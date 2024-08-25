# wotlwedu

## What is wotlwedu?

*wotlwedu* (What'll We Do?) is an intersection between "Wheel of Lunch" and "Survey Monkey".

When you're stuck making a decision, the idea is that you can create a list of items for your friends to vote on. Those items can be anything such as places to go, meals to eat, movies to watch or cocktails to try.
In wotlwedu, we call those elections. 

You can attach an image to the item or an election to add some visual inspiration.
You can also share an image, item or list with one of your friends and they can share the same with their friends.

For some details, take a look at the blog post at https://www.raveloxprojects.com/blog/?p=892

## What is wotlwedu-minimal?

This is the frontend to wotlwedu which is designed for cellphone-resolution browsers. In the future, we'll also have native iOS and Android apps.
**wotlwedu-minimal** is an Angular app.

More details can be found at https://www.raveloxprojects.com/blog/?p=911.

## How is wotlwedu-minimal installed?

**wotlwedu-minimal** is an Angular app so there are a few steps to take and it depends on how you want to deploy it.

### Manual build
1. Install **nodejs** and make sure that **npm** is in your path. Which version you choose to is down to you and so the install instructions will be either available at https://nodejs.org or your platform's package repository.
  
2. Clone this git repository

    `git clone https://github.com/ravelox/wotlwedu-minimal.git`

3. Change directory to the checked out repository

    `cd wotlwedu-minimal`

4. Install angular/cli. This app was built using Angular 17.3. You probably need root or admin access to be able to do this.

    `npm install -g @angular/cli`

5. Install the npm packages required by this app. For those not familiar with Angular, the package versions are listed in the **packages.json** file. This step may take some time to complete as each package has their own dependencies that they need to download.

    `npm install`
6. Before running the app, you will need to configure the app to talk with a **wotlwedu** API server. Edit the file **src/app/global.ts** and change the setting for **BASE_API_URL**. If you do not change this setting, the default is https://api.wotlwedu.com:9876/. For information about running **wotlwedu** API server, you can download the software at https://github.com/ravelox/wotlwedu-backend.
7. If you want to run the app as a development version (which includes the source file names and other information for debugging), you can use the following command which will make the app available through a browser at http://localhost:4200 (by default)

    `ng serve`
8. If you want to run the app as a development version but listening on an IP address **as well as** localhost, you use the following command. Note that the example uses 0.0.0.0 to listen on all available addresses. You will need to decide which addresses you want to use.

    `ng serve --host 0.0.0.0`
   
9. If you want to run the app as a production app (which is more optimized and obfuscated), you will need a web server to server the files. **wotlwedu-minimal** has been tested with Apache2. You can do the following:
    1. Build the app

    `ng build --configuration=production`

    2. Copy **everything** under dist/frontend/browser to the location your webserver serves its files from. If you are building the app multiple times, be aware that the build generates unique filenames each time so you will need to clean out any previous installations from your webserver directory.
    3. You will need to configure your web server to redirect non-existent URLs to index.html of the app. If anyone asks, it's because **wotlwedu-minimal** is a routed app. For Apache2, the following rules can be added to your httpd.conf, apache2.conf or your vhost configuration file:
```
RewriteEngine on
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !\.(?:css|js|map|jpe?g|gif|png)$ [NC]
RewriteRule ^(.*)$ /index.html?path=$1 [NC,L,QSA]
```

### Docker build ###
A **Dockerfile** is provided in the repository. Additionally, the files **docker-entrypoint.sh** and **apache-config/wotlwedu-ssl.conf** are required for the build. These files should be reviewed. Both port **80** and **443** are exposed. The docker container is created to use SSL. It is not advisable to run this without SSL enabled.
To build the Docker image, run the following command in the wotlwedu-minimal repository directory:
  `docker build --no-cache -t ravelox/wotlwedu-minimal .`

A **docker compose** file is also available as **wotlwedu-minimal.compose.yaml**. When you have the Docker container image created, you can use the compose file to start a container:

  `docker compose -f wotlwedu-minimal.compose.yaml up -d`

This makes the container available on port 443.
**NOTE:** The compose file requires a volume mounted from /secrets **on the host machine** to hold the SSL certificate and key. This allows for host-specific information to be stored outside of the Docker image.

There are environment variables in the compose file that need to be set to your specific settings:
```
- WOTLWEDU_SSL_KEY_FILE=/secrets/server.key
- WOTLWEDU_SSL_CERT_FILE=/secrets/server.crt
- WOTLWEDU_API_URL=https://api.wotlwedu.com:9876/
- WOTLWEDU_SERVER_NAME=mobile.wotlwedu.com
```
**WOTLWEDU_SSL_KEY_FILE** and **WOTLWEDU_SSL_CERT_FILE** should point to your SSL files. Do **NOT** use softlinked files as Docker will try to resolve the links and not find the files inside the container environment.
**WOTLWEDU_API_URL** should be the URL used to talk with the **wotlwedu-backend** API server.
**WOTLWEDU_SERVER_NAME** configures how the container's Apache server identifies itself. This is not required but nice to have.
