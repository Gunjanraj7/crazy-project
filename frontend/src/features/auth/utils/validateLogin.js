const MIN_USERNAME_LENGTH = 3;
const MIN_PASSWORD_LENGTH = 6;

// Returns an object of field -> error message. An empty object means the form is valid.
export function validateLogin({ username, password }) {
  const errors = {};

  if (!username.trim()) errors.username = 'Username is required.';
  else if (username.trim().length < MIN_USERNAME_LENGTH)
    errors.username = `Username must be at least ${MIN_USERNAME_LENGTH} characters.`;

  if (!password) errors.password = 'Password is required.';
  else if (password.length < MIN_PASSWORD_LENGTH)
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;

  return errors;
}
