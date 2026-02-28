# Changelog

## 0.1.6 - 2026-02-28
- Refactor notifications to use a local store with optimistic item/status updates instead of refetching the full list after every action.
- Consume structured backend notification socket payloads to update unread badges and inbox rows with deltas.
- Remove redundant per-notification detail fetches for common actions by using the notification list payload directly.

## 0.1.4 - 2026-02-28
- Align with backend category behavior updates:
- Category assignment is user-scoped.
- Category-enabled lists may return grouped menus when `collapsible=true`.
- Workgroup/organization ID placeholder values (`""`, `"undefined"`, `"null"`) are normalized by the backend; client behavior should treat these IDs as optional.
- Add `.helmignore` and optional per-environment Helm service/ingress overrides.

## 0.1.2 - 2026-02-14
- Tenant/admin concepts and docs refreshed for organization/workgroup-aware backend behavior.
