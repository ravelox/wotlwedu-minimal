# Changelog

## 0.1.4 - 2026-02-28
- Align with backend category behavior updates:
- Category assignment is user-scoped.
- Category-enabled lists may return grouped menus when `collapsible=true`.
- Workgroup/organization ID placeholder values (`""`, `"undefined"`, `"null"`) are normalized by the backend; client behavior should treat these IDs as optional.
- Add `.helmignore` and optional per-environment Helm service/ingress overrides.

## 0.1.2 - 2026-02-14
- Tenant/admin concepts and docs refreshed for organization/workgroup-aware backend behavior.
