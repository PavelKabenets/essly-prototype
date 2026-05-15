export type Message = {
  id: string;
  from: 'user' | 'ai';
  text: string;
};

export const AI_WELCOME: Message = {
  id: 'welcome',
  from: 'ai',
  text: "I'm here. We can start small — what's on your mind right now?",
};

// Keyword-aware reply selection (cheap pseudo-context to mimic "AI analyzes
// conversation context, user preferences, behavioral patterns").
const REPLIES = {
  heavy: [
    'That sounds like a lot to carry. You\'re not alone in this.',
    'Take your time. There\'s no need to wrap it up neatly.',
    'I notice the weight in what you said. We can sit with it together for a moment.',
  ],
  question: [
    "I don't have a single answer, but I can think it through with you. What's pulling at you most?",
    'A good question to bring here. What feels true when you ask it quietly?',
    "Let's stay with the question for a beat. Where did it come from?",
  ],
  positive: [
    'I love hearing this. What part of it do you want to hold on to?',
    'That\'s a soft, good thing. Worth marking.',
    'There\'s a lightness in how you said that. Stay with it.',
  ],
  reflective: [
    'Whatever you say next, there\'s no wrong direction.',
    'Take your time. I\'m here as long as you need.',
    'What part of that feels heaviest right now?',
    'You found the words. That counts.',
    'I noticed a softness in how you said that. Stay with it for a moment.',
  ],
};

const HEAVY = ['sad', 'tired', 'anxious', 'stressed', 'lost', 'lonely', 'hurt', 'heavy', 'overwhelm', 'broken', 'cry', 'numb', 'stuck'];
const POSITIVE = ['happy', 'good', 'great', 'better', 'love', 'excited', 'grateful', 'calm', 'proud', 'peace'];

let cycle = { heavy: 0, question: 0, positive: 0, reflective: 0 };

export function pickAiReply(userText: string): string {
  const t = userText.toLowerCase();
  let bucket: keyof typeof REPLIES = 'reflective';
  if (t.includes('?')) bucket = 'question';
  else if (HEAVY.some((w) => t.includes(w))) bucket = 'heavy';
  else if (POSITIVE.some((w) => t.includes(w))) bucket = 'positive';

  const arr = REPLIES[bucket];
  const reply = arr[cycle[bucket] % arr.length];
  cycle[bucket] += 1;
  return reply;
}

export function resetAiReplies() {
  cycle = { heavy: 0, question: 0, positive: 0, reflective: 0 };
}

// Canned "transcripts" — each tap of Re-record cycles to a new one.
const TRANSCRIPTS = [
  'I feel a little uncertain today, but I want to talk it through.',
  "I'm tired, but I don't know if it's the body tired or the other kind.",
  'Today felt heavy. I\'m trying to figure out why.',
  'There was a moment this morning when everything just clicked.',
  'I keep going back to that one thing she said yesterday.',
  'I notice I\'m holding my breath again without realising it.',
];

let transcriptIdx = 0;
export function nextTranscript(): string {
  const t = TRANSCRIPTS[transcriptIdx % TRANSCRIPTS.length];
  transcriptIdx += 1;
  return t;
}

// Mock past conversations (loaded when user taps an item in the menu drawer)
export type PastConversation = {
  id: string;
  title: string;
  preview: string;
  when: string;
  messages: Message[];
};

export const PAST_CONVERSATIONS: PastConversation[] = [
  {
    id: '1',
    title: 'Today',
    preview: "I've been staring at this screen for a while.",
    when: '11:09',
    messages: [
      { id: 't1', from: 'user', text: "I've been staring at this screen for a while." },
      { id: 't2', from: 'user', text: "I don't know what I'm supposed to say. It all feels… messy." },
      { id: 't3', from: 'ai', text: "You found the words. I'm with you right now." },
      { id: 't4', from: 'ai', text: "It's alright, let it be messy. That part matters too. « It doesn't have to make sense to be real. »" },
    ],
  },
  {
    id: '2',
    title: 'Slow Sunday morning',
    preview: 'It felt good to just sit with my coffee and…',
    when: 'Yesterday',
    messages: [
      { id: 's1', from: 'user', text: 'It felt good to just sit with my coffee and not do anything for an hour.' },
      { id: 's2', from: 'ai', text: 'Stillness has its own kind of doing. What did you notice in that hour?' },
      { id: 's3', from: 'user', text: 'The sun moved across the wall. The cat blinked at me twice. That was it.' },
      { id: 's4', from: 'ai', text: 'Small ordinary things, witnessed. That counts as a full morning.' },
    ],
  },
  {
    id: '3',
    title: 'A walk that cleared things',
    preview: 'The cold air helped me realise I was holding…',
    when: '2d ago',
    messages: [
      { id: 'w1', from: 'user', text: 'The cold air helped me realise I was holding my shoulders up around my ears.' },
      { id: 'w2', from: 'ai', text: "Bodies remember what minds skip. What does your body want right now?" },
      { id: 'w3', from: 'user', text: 'Honestly? Rest. And to be left alone for a little.' },
      { id: 'w4', from: 'ai', text: 'That\'s a real answer. You\'re allowed to want both of those things.' },
    ],
  },
  {
    id: '4',
    title: 'On feeling stuck',
    preview: "I don't know what I want, only what I don't.",
    when: '5d ago',
    messages: [
      { id: 'f1', from: 'user', text: "I don't know what I want, only what I don't." },
      { id: 'f2', from: 'ai', text: "Knowing what you don't want is information too. What's at the top of that list?" },
      { id: 'f3', from: 'user', text: 'Going back to how things were last year. That\'s the loudest no.' },
      { id: 'f4', from: 'ai', text: 'Then that no is the start of a direction. Direction is enough for now.' },
    ],
  },
];
