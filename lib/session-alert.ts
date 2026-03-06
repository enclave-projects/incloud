/**
 * Fire-and-forget session alert email.
 * Never throws — failures are silently ignored so auth flow isn't affected.
 */
export function sendSessionAlert(
  userId: string,
  name: string,
  email: string,
  type: "login" | "register"
) {
  fetch("/api/session-alert", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, name, email, type }),
  }).catch(() => {
    // Silently ignore – email is best-effort
  });
}
