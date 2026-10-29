// Each validator returns an object of field -> error message. An empty object means the form is valid.

const MIN_USERNAME_LENGTH = 3;
const MAX_USERNAME_LENGTH = 32;
const MIN_PASSWORD_LENGTH = 8;
const USERNAME_PATTERN = /^[a-z0-9_.-]+$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const hasErrors = (errors) => Object.values(errors).some(Boolean);

export function validateEmail(email) {
  if (!email.trim()) return 'Email is required.';
  if (!EMAIL_PATTERN.test(email.trim())) return 'Enter a valid email address.';
  return undefined;
}

function validateNewPassword(password) {
  if (!password) return 'Password is required.';
  if (password.length < MIN_PASSWORD_LENGTH) return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  return undefined;
}

export function validateLogin({ username, password }) {
  return {
    username: username.trim() ? undefined : 'Username is required.',
    password: password ? undefined : 'Password is required.',
  };
}

export function validateSignup({ displayName, username, email, password, confirmPassword, acceptTerms }) {
  const name = username.trim();
  return {
    displayName: displayName.trim() ? undefined : 'Tell us what to call you.',
    username: !name
      ? 'Username is required.'
      : name.length < MIN_USERNAME_LENGTH
        ? `Username must be at least ${MIN_USERNAME_LENGTH} characters.`
        : name.length > MAX_USERNAME_LENGTH
          ? `Username must be at most ${MAX_USERNAME_LENGTH} characters.`
          : !USERNAME_PATTERN.test(name)
            ? 'Only letters, numbers, dots, dashes and underscores.'
            : undefined,
    email: validateEmail(email),
    password: validateNewPassword(password),
    confirmPassword: confirmPassword === password ? undefined : 'Passwords don’t match.',
    acceptTerms: acceptTerms ? undefined : 'Please accept the terms to continue.',
  };
}

export function validatePasswordChange({ currentPassword, newPassword, confirmPassword }) {
  return {
    currentPassword: currentPassword ? undefined : 'Enter your current password.',
    newPassword: validateNewPassword(newPassword),
    confirmPassword: confirmPassword === newPassword ? undefined : 'Passwords don’t match.',
  };
}

// 0–4 score used by the strength meter.
export function getPasswordStrength(password) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= MIN_PASSWORD_LENGTH) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password) && /[^a-z0-9]/i.test(password)) score++;
  return score;
}
