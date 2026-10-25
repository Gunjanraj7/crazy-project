// How the guardian cat reacts to what's happening in the login form.
export const MOOD = {
  IDLE: 'idle', // follows the mouse
  TYPING: 'typing', // reads along as the username is typed
  HIDING: 'hiding', // eyes shut while the password is hidden
  PEEKING: 'peeking', // one eye open when the password is revealed
  LOADING: 'loading', // scanning while credentials are checked
  ERROR: 'error',
  SUCCESS: 'success',
};

export const MOOD_CAPTIONS = {
  [MOOD.IDLE]: 'Watching every move.',
  [MOOD.TYPING]: 'Reading along…',
  [MOOD.HIDING]: 'Eyes shut. Your secret is safe.',
  [MOOD.PEEKING]: 'Just a tiny peek…',
  [MOOD.LOADING]: 'Verifying identity…',
  [MOOD.ERROR]: 'Access denied. Try again.',
  [MOOD.SUCCESS]: 'Identity confirmed. Welcome in.',
};
