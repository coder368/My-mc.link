# My-MC SMP Dashboard Redesign Plan

## Product scope

Redesign the existing React/Vite Minecraft server status dashboard for two realms while preserving the current live status, realm switching, player information, uptime, server details, sharing, configuration, notifications, audio, and Discord-related flows exposed by the source. The experience should feel professionally crafted, modern, aesthetic, and especially polished on mobile. No data or publishing actions are performed by the UI without the user's existing interaction.

## Design direction

- **Design movement:** editorial game-operations interface: the precision of GitHub's developer tooling, softened with the tactile calm of a premium Apple utility app.
- **Core principles:** status first; calm density; distinctive but restrained color; touch-first clarity.
- **Color philosophy:** a deep ink base tinted toward blue-violet rather than pure black, with an ownable lime signal color for healthy server state, copper/ember accents for attention, and a quiet teal secondary signal. Status colors remain high-contrast and semantic. Avoid decorative purple gradients and gray-on-color text.
- **Palette:** obsidian ink `#0B0D0D`, panel `#121716`, raised panel `#1A211F`, line `#2B3934`, text `#F4F4EE`, muted `#A8B2AA`, signal lime `#B8F26B`, copper `#D7AE55`, ember `#F28B45`, alert coral `#F26952`, teal `#82D6C1`.
- **Layout paradigm:** a vertical operations rail: compact identity/status header, prominent selected-realm health block, then a staggered diagnostic stream of telemetry panels. Avoid a generic centered marketing grid.
- **Signature elements:** a thin signal-beam background grid; oversized live-status numerals; pill-shaped realm switcher with a moving active indicator; restrained inner highlights and 1px borders instead of heavy nested glass cards.
- **Interaction philosophy:** every interaction gives an immediate, quiet response—pressed states, copied-state confirmation, realm transition continuity, and loading skeletons. Touch targets are at least 44px and controls remain reachable with one thumb.
- **Animation:** use short ease-out transitions (160–280ms), crossfade/slide telemetry on realm changes, number and progress interpolation where meaningful, subtle ambient background drift, and shimmer only for loading. No bounce or elastic easing. Respect `prefers-reduced-motion` by removing transforms and ambient motion.
- **Typography:** use `Plus Jakarta Sans` for the Goga-like geometric interface and `Bodoni Moda` as a sparing editorial italic accent; keep `IBM Plex Mono` for IPs, metrics, timestamps, and technical values. Operational labels use a subtle dotted ink texture for a crafted display-detail nod. Headings use tight tracking and strong weight; body copy uses generous line-height; labels are compact uppercase with letter spacing.
- **Brand essence:** a calm command center for Minecraft communities that want the truth about their realms at a glance. Personality: assured, technical, welcoming.
- **Brand voice:** direct, warm, operational. Example lines: “Your realm is ready.” and “Signal is clean — 12 players online.”
- **Wordmark/mark:** a compact two-notch signal glyph that echoes a Minecraft block silhouette and a telemetry pulse, paired with the My-MC wordmark.
- **Signature brand color:** signal lime `#B8F26B`.

## Implementation approach

1. Preserve the existing TypeScript types, services, data, and behavior.
2. Replace the current visual tokens and shell styles, then refine the high-traffic components: navbar, intro, realm selector, server status, player/uptime panels, and responsive section layout.
3. Add accessible motion wrappers and reduced-motion CSS without adding a runtime animation dependency beyond the existing stack.
4. Keep supplied realm artwork as contextual imagery only; do not add decorative stock art to the dashboard.
5. Add the required static `/manus-routes.json` manifest for the single-page route.
6. Install Impeccable project-local and use its detector/audit guidance to catch overused fonts, weak contrast, cramped touch targets, and stale motion patterns.

## Project structure

- `src/App.tsx`: application state, realm selection, refresh loop, modal/toast orchestration.
- `src/components/`: presentation modules for navigation, status, telemetry, rules, activity, Discord, and dialogs.
- `src/services/`: live server status and history/log integrations.
- `src/data/`: default realm/config content.
- `src/assets/images/`: supplied realm artwork.
- `src/index.css`: global design tokens, responsive layout primitives, motion and accessibility rules.
- `public/manus-routes.json`: route manifest for the dashboard shell.
- `PRODUCT.md`, `DESIGN.md`: Impeccable durable product and visual-system context.
