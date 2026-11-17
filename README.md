# V20 Character Sheet — simple, installable

A plain Vampire: The Masquerade V20 sheet you keep yourself. Four files, no build step:
`index.html`, `manifest.webmanifest`, `sw.js`, `icons/`. Hosted on GitHub Pages from `main`;
pushing to `main` updates every device the next time the app opens with a signal.

The running version shows under the title. Bump `APP_VERSION` / `APP_BUILD` in `index.html`
and `CACHE` in `sw.js` on every deploy.

## What it does (v2.0.0)

- **Sheets:** pick one in the top bar. Ships with **MJD** (old chronicle, S58) and **Mitch**
  (new chronicle draft). The ⋯ button makes, renames or deletes a sheet.
- **Dots:** tap a dot to set the rating; tap the current rating to drop one. The lock button
  stops accidental dot changes; pools, health, dice and text always work.
- **Specialties:** a text field beside every Attribute and Ability.
- **Custom rows:** `+ add` under each Ability column, Disciplines and Backgrounds.
- **Condition:** Humanity, Willpower (rating and pool), blood pool (20 boxes), health
  (tap cycles / bashing, X lethal, ✱ aggravated).
- **Experience:** one line per award or spend; earned, spent and banked total themselves.
- **Notes:** one free text block, plus one for Merits and Flaws.
- **Dice:** set the number of d10s and the difficulty, roll. 10s are black, 1s red, anything at
  or above the difficulty green. Nothing is counted for you.
- **Backup:** download or restore everything as one `.json`. Storage is per device.

## Coming from v1.x

v2 uses its own storage. On first open it copies the old Mitch's XP ledger, notes, blood and
Willpower pool into MJD. The v1 data is left in place and untouched.
