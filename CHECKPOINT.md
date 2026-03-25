# Checkpoint

Last updated: 2026-03-24
Repo: `wotlwedu-minimal`
Current version: `0.1.13`

## Current Focus

This repo is archived and obsolete. It should be treated as locked and retained only for historical reference unless an explicit exception is requested.

## Implemented State

- This repo is no longer an active target for new operational work.
- Google sign-in and invite-aware onboarding already existed.
- The auth flow now shows a clearer expired-token message for deferred Google link confirmation.
- The user profile now includes:
  - linked sign-in methods
  - unlink actions for removable social identities
  - recent account activity from `/user/:userId/authaudit`
  - organization audit activity when the user has access
  - denser support/admin information presented as cards, outcome chips, and a quick audit summary
- Runtime config template already includes `googleClientId`.

## Key Files For This Baseline

- [src/app/auth/auth.component.ts](/Users/dkelly/Projects/wotlwedu/wotlwedu-minimal/src/app/auth/auth.component.ts)
- [src/app/service/userdata.service.ts](/Users/dkelly/Projects/wotlwedu/wotlwedu-minimal/src/app/service/userdata.service.ts)
- [src/app/userprofile/userprofile.component.ts](/Users/dkelly/Projects/wotlwedu/wotlwedu-minimal/src/app/userprofile/userprofile.component.ts)
- [src/app/userprofile/userprofile.component.html](/Users/dkelly/Projects/wotlwedu/wotlwedu-minimal/src/app/userprofile/userprofile.component.html)
- [src/assets/wotlwedu-config.json.template](/Users/dkelly/Projects/wotlwedu/wotlwedu-minimal/src/assets/wotlwedu-config.json.template)
- [README.md](/Users/dkelly/Projects/wotlwedu/wotlwedu-minimal/README.md)

## Verification Already Run

Passed:

```bash
npm run build
```

## Notes

- This repo still follows runtime config injection rather than Vite build-time envs.
- This repo is archived and should not receive routine feature work.

## Likely Next Actions

1. Leave locked unless a migration, emergency fix, or explicit archival exception is requested.
2. Direct new operational admin/support work into `wotlwedu-admin` instead.
