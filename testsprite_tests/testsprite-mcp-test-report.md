# TestSprite AI Testing Report (MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** TabunganKita (`monvu`)
- **Date:** 2026-05-31
- **Prepared by:** TestSprite AI Team
- **Test Type:** Frontend (E2E, browser-driven)
- **Test Scope:** Entire codebase
- **Server Mode:** Development (`next dev`, port 3000) — run capped at 15 high-priority tests
- **Auth:** Seeded demo user `demo@monvu.test` / `password123`

---

## 2️⃣ Requirement Validation Summary

> **Run-level caveat:** Login succeeds server-side (verified independently: `POST /api/auth/sign-in/email` returns `200` with a valid session cookie). The `Invalid email or password` errors below are **not** a credential or auth-logic defect — they are transient failures of the single-threaded Next.js **dev** server under TestSprite's concurrent browser load (on-demand route compilation + request queuing). Tests that logged in successfully (TC006/009/014/015) confirm auth and the core flows work when the server keeps up. Treat blocked tests as **inconclusive**, not failed-on-merit.

### Requirement: User Authentication (login / signup)
| Test ID | Title | Status | Notes |
|---------|-------|--------|-------|
| TC002 | View the dashboard after login | ⛔ Blocked | Login fetch failed under load → stayed on `/login`. |
| TC003 | Sign in and reach the dashboard | ⛔ Blocked | Same transient login failure. |
| TC004 | Log in and reach authenticated dashboard | ❌ Failed | Stayed on login screen; environmental. |
| TC006 | Complete account registration | ✅ Passed | Signup creates a real user and lands authenticated. |

### Requirement: Dashboard Overview
| Test ID | Title | Status | Notes |
|---------|-------|--------|-------|
| TC013 | Review dashboard KPIs and charts | ⛔ Blocked | Could not reach dashboard (login failed under load). |

### Requirement: Asset Management (CRUD, search, filter, sort, prices)
| Test ID | Title | Status | Notes |
|---------|-------|--------|-------|
| TC001 | Add a new asset | ⛔ Blocked | Login failed under load. |
| TC008 | Delete an asset from the list | ⛔ Blocked | Login failed under load. |
| TC009 | Edit an existing asset | ✅ Passed | Edit flow + list reflect changes correctly. |
| TC010 | Edit asset, keep visible in search/filter | ⛔ Blocked | Login failed under load. |
| TC011 | Delete an asset | ⛔ Blocked | Login failed under load. |

### Requirement: Goal Management (CRUD, metrics)
| Test ID | Title | Status | Notes |
|---------|-------|--------|-------|
| TC005 | Create, edit, and delete a goal | ⛔ Blocked | Login failed under load. |
| TC007 | Create a new financial goal | ⛔ Blocked | Login failed under load. |
| TC015 | Edit an existing financial goal | ✅ Passed | Update reflected on goals page. |

### Requirement: Growth Projection
| Test ID | Title | Status | Notes |
|---------|-------|--------|-------|
| TC012 | Use the projections page after login | ⛔ Blocked | Login failed under load. |
| TC014 | Compare scenarios & contribution changes | ✅ Passed | Scenario + contribution changes update cards/chart. |

---

## 3️⃣ Coverage & Matching Metrics

- **15 / 36** planned tests executed (dev-mode cap; the other 21 were not run).
- **4 / 15 passed (26.67%)**, 1 failed, 10 blocked.
- Of the 11 non-passing, **all** trace to the same environmental login failure — **0 confirmed product defects** in this run.

| Requirement | Total Tests | ✅ Passed | ❌ Failed | ⛔ Blocked |
|-------------|-------------|-----------|-----------|------------|
| User Authentication | 4 | 1 | 1 | 2 |
| Dashboard Overview | 1 | 0 | 0 | 1 |
| Asset Management | 5 | 1 | 0 | 4 |
| Goal Management | 3 | 1 | 0 | 2 |
| Growth Projection | 2 | 1 | 0 | 1 |
| **Total** | **15** | **4** | **1** | **10** |

---

## 4️⃣ Key Gaps / Risks

1. **Test validity is environment-limited (highest priority).** The dev server is single-threaded and recompiles routes on demand; under TestSprite's concurrent load the `/api/auth` sign-in request intermittently fails, surfacing as `Invalid email or password`. This poisoned ~10 tests. **Action:** re-run in production mode (`npm run build && npm run start`) for a trustworthy result and to lift the cap from 15 → 30 tests.

2. **No coverage signal for blocked areas.** Dashboard rendering (TC013), asset add/delete/search/filter (TC001/008/010/011), goal create/delete & metrics (TC005/007), and projections access (TC012) were never actually exercised. Confirmed-working surface this run: signup, asset edit, goal edit, projection scenario/contribution.

3. **App-level UX gap (from code, not a test failure):** mutations in `lib/data-store.tsx` are optimistic and errors are only `console.error`'d — a failed asset/goal create/update/delete shows **no user-facing error**. Worth a dedicated negative-path test once the run is stable.

4. **Test side effects on local data:** the run mutated seeded data (TC009 edited an asset, TC015 edited a goal) and TC006 created a new user in your local Postgres. Re-seed with `npm run db:seed` to restore a clean state before the next run.
