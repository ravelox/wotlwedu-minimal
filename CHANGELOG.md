# Changelog

## 0.1.9 - 2026-03-24
- Add Google sign-in to the Angular auth flow.
- Add invite-aware onboarding against `GET /login/invite/:token` and `POST /login/google`.
- Add runtime `googleClientId` configuration for local and container deployments.

## 0.1.8 - 2026-03-09
- Harden client auth/session restoration logic to avoid using malformed persisted token state.
- Align register/password-reset token flow handling with backend security validation changes.
- Bump runtime config metadata to app version `0.1.8`.

## 0.1.7 - 2026-03-01
- automatically sync `src/assets/wotlwedu-config.json.template` `appVersion` from `package.json` before local builds, starts, watches, and tests
- fix startup auth-state handling so missing saved token data no longer crashes auto-login
- initialize pagination defaults to avoid `page=undefined&items=0` requests on first load
- sanitize persisted workgroup scope and clear stale workgroup selections that trigger invalid scoped requests
- update Docker Compose to build from the local repo and use the checked-in relative `./secrets` mount
- request `category` details for item collection fetches so categorized item rendering has the data it needs
- group categorized item, image, list, election, group, and workgroup selectors by category
- preserve category labels exactly as entered instead of forcing uppercase in grouped list headers
- restore full-width selector rows after grouped rendering was introduced
- make each category section collapsible in categorized selector lists

## 0.1.6 - 2026-02-28
- refactor notifications to use a local store with optimistic item/status updates instead of refetching the full list after every action
- consume structured backend notification socket payloads to update unread badges and inbox rows with deltas
- remove redundant per-notification detail fetches for common actions by using the notification list payload directly

## 0.1.5 - 2026-02-28
- avoid invalid auto-login state handling and initialize pagination defaults defensively

## 0.1.4 - 2026-02-28
- align with backend category behavior updates:
- category assignment is user-scoped
- category-enabled lists may return grouped menus when `collapsible=true`
- workgroup/organization ID placeholder values (`""`, `"undefined"`, `"null"`) are normalized by the backend; client behavior should treat these IDs as optional
- add `.helmignore` and optional per-environment Helm service/ingress overrides

## 0.1.2 - 2026-02-14
- tenant/admin concepts and docs refreshed for organization/workgroup-aware backend behavior
