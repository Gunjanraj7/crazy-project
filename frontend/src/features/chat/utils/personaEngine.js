// Offline "brain" for the avatars: detects what the user is going for, then answers from the
// avatar's own reply bank so every persona responds in character.

const INTENTS = [
  { id: 'sad', pattern: /\b(sad|tired|stressed|stress|anxious|anxiety|lonely|depressed|lost|bad day|upset|overwhelmed|exhausted)\b/i },
  { id: 'wellbeing', pattern: /how are (you|u)|how'?s it going|how do you feel|what'?s up/i },
  { id: 'identity', pattern: /who are (you|u)|what are you|your name|about yourself|your story/i },
  { id: 'joke', pattern: /\b(joke|funny|laugh|make me smile|something weird)\b/i },
  { id: 'thanks', pattern: /\b(thanks|thank you|thx|ty|appreciate it)\b/i },
  { id: 'bye', pattern: /\b(bye|goodbye|see ya|later|good ?night|cya)\b/i },
  { id: 'help', pattern: /\b(help|stuck|advice|wisdom|tips?|plan|habit|quest|motivat\w*|solve|debug|how (do|can|should) i)\b/i },
  { id: 'greet', pattern: /^\s*(hi|hello|hey|yo|sup|greetings|hola|good (morning|evening|afternoon))\b/i },
  { id: 'question', pattern: /\?\s*$/ },
];

const STOP_WORDS = new Set(
  'a an the and or but if then so to of in on at for with about from into over is are was were be been am do does did have has had i me my mine you your yours we us our it its this that these those what which who whom how why when where can could should would will just really very please tell give let make feel feeling some any more much not dont im ive youre want need like get got help debug solve fix plan stuck tell joke something anything think know all one'.split(
    ' ',
  ),
);

export function detectIntent(message) {
  return INTENTS.find(({ pattern }) => pattern.test(message))?.id ?? 'fallback';
}

// Picks the phrase to echo back: the last run of meaningful words, at most two
// ("help me debug my login form" -> "login form", "plan my week" -> "week").
export function extractTopic(message) {
  const words = message.toLowerCase().match(/[a-z][a-z'-]+/g) ?? [];
  const isMeaningful = (word) => word.length > 2 && !STOP_WORDS.has(word.replace(/'/g, ''));

  let run = [];
  let lastRun = [];
  for (const word of words) {
    if (isMeaningful(word)) {
      run.push(word);
      lastRun = run;
    } else {
      run = [];
    }
  }
  return lastRun.slice(-2).join(' ') || 'that';
}

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

export function fillTemplate(template, { name, topic = 'that' }) {
  return template.replaceAll('{name}', name).replaceAll('{Topic}', capitalize(topic)).replaceAll('{topic}', topic);
}

// Avoids repeating whatever the avatar said most recently, when there's an alternative.
function pickFresh(options, recentReplies, context) {
  const filled = options.map((template) => fillTemplate(template, context));
  const fresh = filled.filter((reply) => !recentReplies.includes(reply));
  const pool = fresh.length > 0 ? fresh : filled;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function generateReply(avatar, message, { name, recentReplies = [] }) {
  const intent = detectIntent(message);
  const options = avatar.replies[intent] ?? avatar.replies.fallback;
  return pickFresh(options, recentReplies, { name, topic: extractTopic(message) });
}
