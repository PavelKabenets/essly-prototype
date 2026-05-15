import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no"
        />
        <title>Eesly — talk to yourself through it</title>
        <meta
          name="description"
          content="Eesly is an AI companion for the messy in-between moments. A clickable prototype of the mobile app."
        />

        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Eesly" />

        <meta property="og:title" content="Eesly" />
        <meta
          property="og:description"
          content="A quiet place to talk to yourself."
        />
        <meta property="og:type" content="website" />

        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />

        <ScrollViewStyleReset />

        <style dangerouslySetInnerHTML={{ __html: globalCss }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const globalCss = `
html, body, #root {
  height: 100%;
  background-color: #0A0A0C;
  color: #fff;
  -webkit-tap-highlight-color: transparent;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
body {
  margin: 0;
  overscroll-behavior-y: none;
}
input, textarea, [role="button"], [tabindex] {
  outline: none !important;
  box-shadow: none !important;
}
*:focus, *:focus-visible {
  outline: none !important;
}
input, textarea {
  font-family: 'DMSans_400Regular', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
/* Strip Chrome/Safari autofill yellow/white background on dark inputs */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active,
textarea:-webkit-autofill {
  -webkit-text-fill-color: #FFFFFF !important;
  -webkit-box-shadow: 0 0 0 1000px transparent inset !important;
  box-shadow: 0 0 0 1000px transparent inset !important;
  caret-color: #008BFF !important;
  transition: background-color 9999s ease-in-out 0s, color 9999s ease-in-out 0s !important;
  background-clip: content-box !important;
}
* {
  -webkit-tap-highlight-color: transparent;
}
`;
