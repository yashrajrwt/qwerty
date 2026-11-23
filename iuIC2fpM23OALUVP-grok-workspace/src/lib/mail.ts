function escapeHtml(value: string) {
  return value
    .replace(/&/g, "\u0026amp;")
    .replace(/</g, "\u0026lt;")
    .replace(/>/g, "\u0026gt;")
    .replace(/"/g, "\u0026quot;");
}

export function verificationEmailHtml(name: string, url: string) {
  const safeName = escapeHtml(name);
  const safeUrl = escapeHtml(url);
  return [
    `<p>Hello ${safeName},</p>`,
    "<p>Confirm your NestInvest email by opening this single-use link (expires in 24 hours):</p>",
    `<p><a href="${safeUrl}">Verify email</a></p>`,
    "<p>If you did not create this nest, ignore this message.</p>",
  ].join("");
}

export function resetEmailHtml(url: string) {
  const safeUrl = escapeHtml(url);
  return [
    "<p>A password reset was requested for your NestInvest nest.</p>",
    "<p>This single-use link expires in 30 minutes:</p>",
    `<p><a href="${safeUrl}">Choose a new password</a></p>`,
    "<p>If you did not ask for this, you can ignore the email. Your password stays the same.</p>",
  ].join("");
}

export function emailChangeHtml(url: string) {
  const safeUrl = escapeHtml(url);
  return [
    "<p>Confirm this address as your new NestInvest email.</p>",
    "<p>This single-use link expires in 2 hours:</p>",
    `<p><a href="${safeUrl}">Confirm new email</a></p>`,
    "<p>If you did not ask for this, keep using your current email.</p>",
  ].join("");
}

export function emailChangeNoticeHtml() {
  return "<p>A request was made to change the email on your NestInvest nest. If that was not you, sign in and change your password.</p>";
}

export function passwordChangedHtml() {
  return "<p>Your NestInvest password was changed.</p><p>If this was not you, reset the password immediately and sign out of other devices.</p>";
}

export async function sendTransactionalEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY?.trim() || process.env.EMAIL_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim() || "NestInvest <noreply@nestinvest.app>";
  if (!key) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: input.to,
        subject: input.subject,
        html: input.html,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
