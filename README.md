# My-MC Realm Signal

A premium, responsive Minecraft server status dashboard for the My-MC SMP dual-realm network. It keeps live server health, player count, latency, Java connection details, uptime, player activity, rules, and Discord guidance in one calm operations view.

## What is included

- Live status checks with online/offline and latency indicators.
- One-tap switching between the My-MC SMP and RCESC realms.
- Mobile-first layouts with touch-friendly controls and reduced-motion support.
- Copyable Java addresses, notifications, configuration, sharing, and audio preferences.
- Uptime and latency history, player activity, player roster, rules, FAQs, and Discord commands.
- A project-local Impeccable skill installation used to guide the redesign and audit the interface.

The skill is available at `.agents/skills/impeccable/` for future design reviews.

## Run locally

Prerequisites: Node.js 18+ and npm.

```bash
npm install
npm run dev
```

The Vite development server listens on `http://localhost:3000`.

## Validate a build

```bash
npm run lint
npm run build
```

The app reads live server status through the existing service fallback chain. No server credentials are required for the read-only public status experience.

## Design direction

The interface uses an ink, signal-jade, ember, and sky palette with Sora for interface typography and IBM Plex Mono for technical values. The visual language combines GitHub-like operational clarity with a premium mobile utility feel: thin signal lines, oversized status numerals, restrained surfaces, and short ease-out motion.
