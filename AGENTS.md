# AGENTS.md (wotlwedu-minimal)

Local instructions for Codex-style agents working in this repository.

## Repo Summary
- App: Angular mobile-first frontend for `wotlwedu-backend`
- Stack: Angular 17 + RxJS + Bootstrap
- Deployment: optional Docker + NGINX

## Key Commands
```bash
npm install
npm start
npm run build
npm test
```

## Runtime Config
- Client runtime config file: `src/assets/wotlwedu-config.json`
- Template source: `src/assets/wotlwedu-config.json.template`
- Primary backend URL value: `apiUrl`

## Where To Make Changes
- Angular app code: `src/app/`
- Runtime config assets: `src/assets/`
- Container startup templating: `999-wotlwedu-config.sh`
- NGINX templates: `nginx-config/`

## Backend Contract Notes
- Backend tenancy uses organization/workgroup scope.
- Category assignment is user-scoped in backend APIs.
- Some collection endpoints can return category grouping with `collapsible=true`.

## Repo Hygiene
- Do not commit `node_modules/`, `dist/`, `.env*`, or secrets.
- Keep frontend behavior aligned with backend auth/scope conventions.
