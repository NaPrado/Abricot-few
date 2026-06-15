# Working in this repo

## 1. API source of truth = the DEPLOYED BACKEND (hard rule)

When in doubt about any endpoint — path, verb, body shape, auth — the authority is the
**deployed backend**, in the `Abricot-be` repo:

- **Custom dispatcher**: `lambdas/{service}/handler.py`. The backend is **not Flask**; each
  Lambda hand-routes requests in a dispatcher. A route exists only if the dispatcher has a
  branch for it (this is why `POST /restaurants/{id}/photo` 404'd until a `/photo` branch
  was added).
- **API Gateway route map**: `infra/locals.tf`. If a path/method isn't mapped here, API GW
  never reaches the Lambda.

**`.mcp/` in this repo is DEPRECATED for contracts.** It is aspirational and has diverged
from reality twice (menu activate, photo upload — see `api-contract.md` §Flagged
divergences). Do not wire a call from a `.mcp/` route. If frontend code and `.mcp/`
disagree, frontend + deployed backend win.

Before adding or changing an API call:
1. Check the existing `src/services/*` module — match its pattern.
2. Confirm the route in `Abricot-be` (`handler.py` dispatcher + `infra/locals.tf`).
3. Only then update `src/services/*` and, if useful, `.claude/api-contract.md`.

## 2. All commands run through the operator (human-in-the-loop)

In this workflow Claude does **not** execute commands — no `pnpm`/build/lint/test, no
`git`, no deploy, no commit/push. **Propose** the exact command(s); the operator runs them
and pastes back output. Claim success only against real output, never assume. (Read/search
and writing files are fine.)

This coexists with CLAUDE.md's non-negotiable verification: type-check + lint must pass —
the operator runs them, you read the result before reporting done.

## 3. Commands (for the operator to run)

```bash
pnpm install        # deps (pnpm is the package manager; lockfile = pnpm-lock.yaml)
pnpm dev            # vite dev server (0.0.0.0:5173)
pnpm type-check     # vue-tsc --build   ← must pass
pnpm lint           # oxlint + eslint (--fix)  ← must pass
pnpm build          # type-check + vite build → dist/
pnpm preview        # serve built dist/ (4173)
```

`pnpm build` runs `type-check` then `build-only` in parallel via `npm-run-all`. The
pre-commit hook (`.pre-commit-config.yaml`) also enforces lint/format.

## 4. Deploy — pipeline on push

- Hosting: the built `dist/` is served from an **S3 website bucket**
  (`abricot-tp3-103236573235-frontend.s3-website-us-east-1.amazonaws.com`, see `.env`).
- Deployment is **pipeline-on-push**: pushing the tracked branch triggers the CI/CD pipeline
  that builds and syncs `dist/` to the bucket. The pipeline + infra (S3 bucket, API GW,
  Lambdas, Cognito, SNS) are defined in **`Abricot-be`** (`infra/`), not in this repo — there
  is no `.github/workflows` here.
- Env: `VITE_*` vars are baked into the bundle at build time (`.env` / `.env.production`).
  Cognito redirect (`VITE_COGNITO_REDIRECT_URI`) must point at API GW `/callback`, not the SPA.

## 5. Code conventions (recap; full rules in CLAUDE.md)
- Strict TS, no `any`; one interface per file under `src/types/`, `*Type` suffix.
- Non-trivial `<script setup>` → colocated `scripts/useX.ts` composable (Vue 3.5+ bans
  `<script setup src>`).
- Services are the only place that touches `http`; components/stores call services.
- English code/comments; Spanish (AR) UI text. No tests unless asked. Targeted edits over
  full-file rewrites.
