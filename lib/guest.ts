// Guest-mode flag. A non-httpOnly cookie read by the (app) server layout to
// decide whether to render the app with sample data instead of redirecting to
// /login. It only unlocks READ-ONLY mock data — never real user data — so
// setting it from the client (document.cookie) is acceptable; spoofing it grabs
// nothing but the demo. Why a cookie and not localStorage: the auth guard runs
// server-side, and only cookies ride along with the request there.
export const GUEST_COOKIE = "guest";

const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function enterGuest() {
  document.cookie = `${GUEST_COOKIE}=1; path=/; max-age=${MAX_AGE}; samesite=lax`;
}

export function exitGuest() {
  document.cookie = `${GUEST_COOKIE}=; path=/; max-age=0; samesite=lax`;
}
