const SPECIAL = /[^A-Za-z0-9]/;

export type PasswordIssue =
  | "length"
  | "too_long"
  | "lower"
  | "upper"
  | "number"
  | "special"
  | "mismatch"
  | "email"
  | "name";

export const NAME_MAX = 80;
export const PASSWORD_MAX = 128;

export function isEmail(value: string) {
  const v = value.trim();
  return v.length > 4 && v.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function passwordIssues(password: string): PasswordIssue[] {
  const issues: PasswordIssue[] = [];
  if (password.length < 10) issues.push("length");
  if (password.length > PASSWORD_MAX) issues.push("too_long");
  if (!/[a-z]/.test(password)) issues.push("lower");
  if (!/[A-Z]/.test(password)) issues.push("upper");
  if (!/[0-9]/.test(password)) issues.push("number");
  if (!SPECIAL.test(password)) issues.push("special");
  return issues;
}

export function passwordScore(password: string) {
  let score = 0;
  if (password.length >= 10) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (SPECIAL.test(password)) score += 1;
  if (password.length > PASSWORD_MAX) return 0;
  return score;
}

export function passwordIssueText(issue: PasswordIssue) {
  switch (issue) {
    case "length":
      return "Use at least 10 characters.";
    case "too_long":
      return "Use at most 128 characters.";
    case "lower":
      return "Include a lowercase letter.";
    case "upper":
      return "Include an uppercase letter.";
    case "number":
      return "Include a number.";
    case "special":
      return "Include a special character.";
    case "mismatch":
      return "Passwords do not match.";
    case "email":
      return "Enter a valid email address.";
    case "name":
      return "Enter your name.";
    default:
      return "Check this field.";
  }
}

export function validateRegister(input: {
  name: string;
  email: string;
  password: string;
  confirm: string;
}) {
  const errors: { field: string; issue: PasswordIssue }[] = [];
  if (input.name.trim().length < 2 || input.name.trim().length > NAME_MAX) {
    errors.push({ field: "name", issue: "name" });
  }
  if (!isEmail(input.email)) errors.push({ field: "email", issue: "email" });
  for (const issue of passwordIssues(input.password)) {
    errors.push({ field: "password", issue });
  }
  if (input.password !== input.confirm) {
    errors.push({ field: "confirm", issue: "mismatch" });
  }
  return errors;
}

export function friendlyAuthError(message: string | undefined) {
  const m = (message ?? "").toLowerCase();
  if (!m) return "Something went wrong. Please try again.";
  if (m.includes("invalid origin")) return "This sign-in origin is not allowed.";
  if (m.includes("already exists") || m.includes("user already") || m.includes("duplicate")) {
    return "An account with that email already exists.";
  }
  if (
    m.includes("invalid email or password") ||
    m.includes("invalid password") ||
    m.includes("invalid credentials") ||
    m.includes("credential")
  ) {
    return "Invalid email or password.";
  }
  if (m.includes("disabled")) return "This account is disabled.";
  if (m.includes("already your email")) return "That is already your email.";
  if (m.includes("could not change")) return "Could not change email.";
  if (m.includes("type delete")) return "Type DELETE to confirm.";
  if (m.includes("forbidden")) return "You do not have access to that.";
  if (m.includes("too many") || m.includes("rate")) {
    return "Too many attempts. Please try again later.";
  }
  if (m.includes("verify")) return "Please verify your email before continuing.";
  if (m.includes("unauthorized") || m.includes("session")) {
    return "Your session has expired. Please log in again.";
  }
  return "Something went wrong. Please try again.";
}
