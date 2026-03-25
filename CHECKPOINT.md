# Checkpoint

Last updated: 2026-03-24
Repo: `wotlwedu-minimal`
Current version: `0.1.10`

## Current Focus

This repo now exposes the user-facing and support-facing parts of the new auth hardening flow in the Angular mobile-oriented client.

## Implemented State

- Google sign-in and invite-aware onboarding already existed.
- The auth flow now shows a clearer expired-token message for deferred Google link confirmation.
- The user profile now includes:
  - linked sign-in methods
  - unlink actions for removable social identities
  - recent account activity from `/user/:userId/authaudit`
  - organization audit activity when the user has access
- Runtime config template already includes `googleClientId`.

## Main Files Changed In This Uncommitted Slice

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
- The current slice focuses on auth, invite, and audit parity rather than broader UI redesign.

## Likely Next Actions

1. Stage, commit, tag, and push this uncommitted slice if accepted.
2. Optionally refine the mobile presentation of audit data if the current profile layout feels too dense.
