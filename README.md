# wotlwedu

## What is wotlwedu?

*wotlwedu* (What'll We Do?) is an intersection between "Wheel of Lunch" and "Survey Monkey".

When you're stuck making a decision, you can create a list of items for your friends to vote on. Those items can be anything such as places to go, meals to eat, movies to watch, or cocktails to try.
In wotlwedu, these polls are called **elections**.

You can attach images to items/elections, and share images/items/lists with friends.

## What is wotlwedu-minimal?

`wotlwedu-minimal` is the Angular frontend optimized for cellphone-resolution browsers.

## Current stack

- Angular `17.3.x`
- Node.js + npm
- Runtime API config loaded from `src/assets/wotlwedu-config.json`
- Optional Docker deployment with NGINX (HTTP + HTTPS)
- Current app config template version: `0.1.1`

## Tenant/admin concepts

The backend now supports tenancy and scoped administration:
- `organization` (tenant boundary)
- `workgroup` (organization sub-unit)
- `systemAdmin` (global admin across organizations/workgroups)
- `organizationAdmin` (admin across workgroups in one organization)
- `workgroupAdmin` (admin for a single workgroup)

If your UI consumes user/auth payloads, ensure it tolerates these additional fields.

## Local development

1. Clone the repo and enter it:
   ```bash
   git clone https://github.com/ravelox/wotlwedu-minimal.git
   cd wotlwedu-minimal
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create runtime config from template:
   ```bash
   cp src/assets/wotlwedu-config.json.template src/assets/wotlwedu-config.json
   ```
4. Edit `src/assets/wotlwedu-config.json` and set `apiUrl` to your backend URL (for example `https://api.wotlwedu.com:9876/`).
5. Start dev server:
   ```bash
   npm start
   ```

The default Angular dev URL is `http://localhost:4200`.

To listen on all interfaces:
```bash
npx ng serve --host 0.0.0.0
```

## Production build (non-Docker)

Build optimized assets:
```bash
npm run build -- --configuration=production
```

Build output is written under `dist/frontend/browser`.

When serving from a web server, configure SPA fallback so unknown routes return `index.html`.

## Docker deployment

This repo includes:
- `Dockerfile`
- `docker-compose.yaml`
- `nginx-config/*.template`
- `999-wotlwedu-config.sh` (entrypoint config generation)

Build image:
```bash
docker build --no-cache -t ravelox/wotlwedu-minimal:nginx .
```

Start with compose:
```bash
docker compose -f docker-compose.yaml up -d
```

Default compose port mapping:
- `9080 -> 80`
- `9081 -> 443`

### Docker environment variables

Set these for container runtime configuration:

```bash
WOTLWEDU_API_URL=https://api.wotlwedu.com:9876/
WOTLWEDU_SERVER_NAME=localhost
WOTLWEDU_SSL_CERT_FILE=/secrets/localhost.crt
WOTLWEDU_SSL_KEY_FILE=/secrets/localhost.key
```

Notes:
- `WOTLWEDU_API_URL` is injected into `/usr/share/nginx/html/assets/wotlwedu-config.json` at startup.
- SSL certificate/key files must exist inside the container path you configure (typically via a mounted `/secrets` volume).
- Update the compose volume path to match your host filesystem.

## Backend reference

For backend setup and current API details, see:
- https://github.com/ravelox/wotlwedu-backend

## AI-assisted features

The Home screen includes an AI panel that calls backend `/ai/*` endpoints:
- election recommendations and summaries
- participant suggestions
- list suggestions from prompt text
- text categorization and moderation
- notification digest and smart defaults
- assistant query
- image description by image ID
