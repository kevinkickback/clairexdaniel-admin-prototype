# Daniel × Claire admin prototype

A local restaurant administration prototype with fictional data. It explores a redesigned service dashboard and the surrounding operational workflows. It does not connect to the production site.

## Run locally

Requires Node.js. No dependency installation or build step is needed.

```sh
npm run dev
```

Open <http://127.0.0.1:5173>. On Windows PowerShell, `npm.cmd run dev` also avoids script execution-policy issues. VS Code includes a **Preview restaurant admin** task.

The development server refreshes the browser when files in `public/` change. Mock changes persist in browser local storage; **Reset demo** restores the starting scenario for October 28, 2026.

## Included workflows

- Service overview, reservations, seating availability, waitlist, cancellations, holds, and prep sheet.
- Reservation creation and editing, main-course selections, private notes, service status, explicit overbooking, and simulated no-show charges.
- Waitlist and hold conversion to reservations, with shared capacity updates.
- Menu blocks, service time slots, guest profiles, memberships, and editable membership plans.
- Website copy, reservation and cancellation policies, booking rules, reviews, and private-event inquiries.
- Menu analytics, activity history, notifications, and a demo account menu.
- Search, filters, pagination, selectable prep columns, Excel/CSV exports, and print styles.

The interface includes keyboard focus states, a skip link, labeled controls, modal focus recovery, mobile navigation with focus containment, reduced-motion support, and text alternatives for analytics.

## Verify

```sh
npm test
npm run check
```

The tests cover reservation validation, capacity and holds, explicit overbooking, edits, course counts, no-show simulation, persistence recovery, CSV escaping, all screen renderers, prep filtering, and Excel structure. The original baseline has also been checked in a browser on desktop and at a phone-sized viewport.

## Project layout

| Path | Purpose |
| --- | --- |
| `public/` | Interface, mock data, domain logic, and export helpers |
| `server.mjs` | Read-only static development server and refresh stream |
| `tests/` | Domain and rendering checks |
| `admin-review.json` | Inventory from the original admin walkthrough |
| `prototype-coverage.json` | Prototype coverage, assumptions, and verification |
| `PROTOTYPE_NOTES.txt` | Implementation and continuation notes |
| `artifacts/` | Visual baseline screenshots |
| `.vscode/` | Shared preview task and port label |

## Remote preview

Forward port **5173** through VS Code's Ports view, or use Microsoft's Dev Tunnels CLI with `scripts/start-private-preview.ps1`. The script expects the official signed tool at `.tools/devtunnel.exe` and an authorized account already signed in. Tunnels use private owner-only access.

Tool binaries, credentials, environment files, logs, and temporary tunnel metadata do not belong in Git. `.tools/` and `.preview/` are ignored. A new temporary tunnel may have a different address.

## Integration boundaries

The existing site uses Next.js before authentication and Angular after authentication. This prototype uses standalone browser modules; it is not a framework migration.

Unseen forms and business rules are proposed mock flows that need validation against the real application. Payments, authentication, email, subscription eligibility, and background hold expiry are not connected. Hold expiry times are informational; cancellation holds and no-show fees are configurable simulations.

The live admin site must remain untouched during prototype work. Preserve the original functional inventory when developing variations.
