// How the neural core reacts to what's happening in the auth forms.
export const MOOD = {
  IDLE: 'idle', // leans towards the mouse
  TYPING: 'typing', // turns towards the form and spins faster as you type
  HIDING: 'hiding', // collapses behind a shield while the password is hidden
  PEEKING: 'peeking', // half-shielded when the password is revealed
  LOADING: 'loading', // scanning while credentials are checked
  ERROR: 'error',
  SUCCESS: 'success',
};

export const MOOD_CAPTIONS = {
  [MOOD.IDLE]: 'Core online. Awaiting input.',
  [MOOD.TYPING]: 'Parsing identity…',
  [MOOD.HIDING]: 'Shields up. Secret encrypted.',
  [MOOD.PEEKING]: 'Shield lowered. Careful…',
  [MOOD.LOADING]: 'Handshake in progress…',
  [MOOD.ERROR]: 'ERR: access denied.',
  [MOOD.SUCCESS]: 'Link established. Welcome.',
};

// How long the success animation plays before moving on to the app.
export const SUCCESS_REDIRECT_DELAY_MS = 1100;

// 0–1: how far along the input the core should look, based on what's been typed.
const FULL_LOOK_LENGTH = 24;
export const typingProgress = (value) => Math.min(value.length / FULL_LOOK_LENGTH, 1);
