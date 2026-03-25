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
- Current frontend package version: `0.1.9` (`package.json`)
- Runtime config `appVersion` is auto-synced from `package.json` before local builds/starts/tests.

## Tenant/admin concepts

The backend now supports tenancy and scoped administration:
- `organization` (tenant boundary)
- `workgroup` (organization sub-unit)
- `systemAdmin` (global admin across organizations/workgroups)
- `organizationAdmin` (admin across workgroups in one organization)
- `workgroupAdmin` (admin for a single workgroup)

If your UI consumes user/auth payloads, ensure it tolerates these additional fields.

## Backend compatibility notes
- Category assignment is now user-scoped in the backend: submitted `categoryId` values must belong to the authenticated user.
- Category-enabled collection endpoints may return grouped category menus when `collapsible=true` is sent.
- Workgroup/organization IDs should be treated as optional and sanitized client-side; backend now normalizes placeholder values like `""`, `"undefined"`, and `"null"`.
- Notification list endpoints are paged newest-first, unread counts are count-based, and live notification events now carry structured payloads for local inbox updates.
- The login page supports Google sign-in through `/login/google` and invite lookup through `/login/invite/:token`.

## Notification behavior

The current notification implementation:
- keeps inbox rows and unread counts in a local store,
- applies structured Socket.IO notification deltas when available,
- avoids extra notification-detail fetches for common actions such as vote entry, friend acceptance, and shared item/image/list actions.

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
4. Edit `src/assets/wotlwedu-config.json` and set:
   - `apiUrl` to your backend URL (for example `https://api.wotlwedu.com:9876/`)
   - `googleClientId` to your Google web client ID if you want Google sign-in enabled
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

Build output is written under `dist/frontend`.

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
docker compose up --build -d
```

Current frontend behavior highlights:
- runtime config `appVersion` is generated from `package.json` automatically before local starts/builds/tests
- categorized item, image, list, election, group, and workgroup selectors render in collapsible category sections
- category labels preserve the exact casing entered by the user
- invalid saved auth/workgroup state is sanitized on startup to avoid broken auto-login and stale scoped requests

Default compose port mapping:
- `9080 -> 80`
- `9081 -> 443`

### Docker environment variables

Set these for container runtime configuration:

```bash
WOTLWEDU_API_URL=https://api.wotlwedu.com:9876/
WOTLWEDU_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
WOTLWEDU_SERVER_NAME=localhost
WOTLWEDU_SSL_CERT_FILE=/secrets/localhost.crt
WOTLWEDU_SSL_KEY_FILE=/secrets/localhost.key
```

Notes:
- `WOTLWEDU_API_URL` is injected into `/usr/share/nginx/html/assets/wotlwedu-config.json` at startup.
- `WOTLWEDU_GOOGLE_CLIENT_ID` is injected into the same runtime config and enables the Google sign-in button.
- SSL certificate/key files must exist inside the container path you configure (typically via a mounted `/secrets` volume).
- Update the compose volume path to match your host filesystem.

## Helm
A Helm chart is available under `helm/wotlwedu-minimal`.

Notes:
- Set `environment` and `environments.<name>.service` / `environments.<name>.ingress` in Helm values to apply optional per-environment service and ingress overrides.

## Backend reference

For backend setup and current API details, see:
- https://github.com/ravelox/wotlwedu-backend
