# Changelog

## 0.1.3 - 2026-02-27
- Align with backend category behavior updates:
- Category assignment is user-scoped.
- Category-enabled lists may return grouped menus when `collapsible=true`.
- Workgroup/organization ID placeholder values (`""`, `"undefined"`, `"null"`) are normalized by the backend; client behavior should treat these IDs as optional.

## 0.1.2 - 2026-02-14
- Tenant/admin concepts and docs refreshed for organization/workgroup-aware backend behavior.
