// Turns the passcode into a hex hash using Web Crypto, so we never
// store or compare the raw passcode itself in the cookie.
export async function hashPasscode(passcode) {
  const data = new TextEncoder().encode(passcode + ":zenfund-salt");
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const AUTH_COOKIE = "zenfund_auth";
