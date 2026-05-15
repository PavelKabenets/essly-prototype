# Essly — clickable web prototype

A clickable web prototype of the **Essly** AI companion mobile app. Built with Expo + React Native Web so the same code can later compile into the production React Native app without rewrites.

Live demo (after deploy): https://essly-prototype.vercel.app

## What this is

- A prototype, not a real app — no backend, no real auth, no real AI.
- Every screen and click flow from the MVP scope (sign in, sign up, forgot password, onboarding, chat) is wired up.
- On desktop the app renders inside an iPhone-style frame. On phones it fills the screen.
- Add to Home Screen on iOS/Android for a more "real app" feel.

## Demo credentials

| Field | Value |
|---|---|
| Email | `demo@essly.app` |
| Password | `demo123` |

Anything else on the sign-in form shows an "Incorrect email or password" error. Sign-up, verification code, and password reset accept any valid-looking input.

## Click flow

```
splash → sign-in ┬─ (demo creds) ─→ onboarding splash → 5 greeting slides → chat
                 ├─ "Sign up"     ─→ sign-up → verify-email (any 6 digits) → onboarding
                 └─ "Forgot?"     ─→ forgot-password → check-email → reset-password → done → sign-in
```

In the chat:
- Type any message + send → AI replies with a scripted line after ~1s.
- Tap the mic → voice listening overlay → auto-transcribes a canned message after ~2s. `×` cancels, `‖` pauses the auto-finish.
- Tap the `≡` menu (top-left) or avatar (top-right) → side drawer with mock past conversations.

## Run locally

```bash
npm install
npm run web
```

Opens at http://localhost:8081.

## Build for web

```bash
npx expo export --platform web
```

Output: `dist/` (static — deploy anywhere).

## Deploy to Vercel

The repo includes `vercel.json` with the right build command. Connect the GitHub repo in the Vercel dashboard or run:

```bash
npx vercel --prod
```

## Stack

- **Expo SDK 54** + **Expo Router** (file-based routing).
- **React Native Web** (built into Expo, renders RN components as HTML/CSS).
- **TypeScript**.
- **react-native-svg** for the star logo.
- **expo-linear-gradient** for the ambient pink glow.

## Project layout

```
app/
├── _layout.tsx              root layout (PhoneFrame, status bar, theme)
├── +html.tsx                web HTML head (title, favicon, PWA meta)
├── index.tsx                redirect → /sign-in
├── (auth)/                  sign-in, sign-up, verify, forgot password flow
├── (onboarding)/            logo splash + 5 multilingual greeting slides
└── (app)/chat.tsx           AI chat with composer, voice overlay, menu drawer
components/
├── PhoneFrame.tsx           iPhone-style bezel on desktop, fullscreen on phone
├── AmbientGlow.tsx          pink vignette glow
├── AuthScreen.tsx           shared shell for auth screens
├── chat/                    ChatHeader, ChatBubble, ChatComposer, VoiceOverlay, MenuDrawer
└── ui/                      Button, TextField, OtpInput, StarLogo, GlassyCircleButton, SocialButton, Divider
theme/                       design tokens (colors, typography, spacing)
mock/chat.ts                 scripted AI replies
```

## Note for the dev who picks this up

This project is set up for `expo export --platform web`. The exact same code will compile to native iOS/Android with `expo run:ios` and `expo run:android` — no rewrite. Auth screens and onboarding were designed from scratch in the matching aesthetic since the Figma file only contained the chat flow. The 4 chat screens (empty, with messages, with keyboard, voice listening) match the Figma designs 1:1.
