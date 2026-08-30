# V20 Character Sheet — installable web app

A Vampire: The Masquerade V20 character sheet that holds ST-issued data on your device
until you paste in new data. Installs to a phone home screen as a real app and works
with no signal.

Everything is four files: `index.html`, `manifest.webmanifest`, `sw.js`, and `icons/`.
No build step, no dependencies, no server code.

The running version is printed under the title in the app. Bump `APP_VERSION` and
`APP_BUILD` near the top of the script in `index.html` whenever you deploy, so the
number on screen tells you what you're actually looking at.

---

## Putting it on your phone

### 1. Make a GitHub repo

On github.com, create a new **public** repository — call it `vtm-sheet` or whatever you
like. Public matters: GitHub Pages only publishes from public repos on a free account.
Nothing about the chronicle lives in these files, so there is nothing to expose. Your
sheet data lives only in your phone's storage after you paste it.

### 2. Push this folder

From this folder (`vtm-sheet-app`):

```bash
git init && git add -A && git commit -m "V20 character sheet app" && git branch -M main && git remote add origin https://github.com/YOUR-USERNAME/vtm-sheet.git && git push -u origin main
```

Replace `YOUR-USERNAME`. If git asks who you are, run
`git config --global user.email "you@example.com"` and
`git config --global user.name "Your Name"` first.

### 3. Turn on Pages

Repo → **Settings** → **Pages** → under "Build and deployment", set Source to
**Deploy from a branch**, branch **main**, folder **/ (root)**. Save.

Wait a minute or two. Your URL will be:

```
https://YOUR-USERNAME.github.io/vtm-sheet/
```

### 4. Install it

- **Android / Chrome:** open the URL, tap the ⋮ menu → **Add to Home screen** (or
  **Install app** if it offers that).
- **iPhone / Safari:** open the URL, tap the Share button → **Add to Home Screen**.
  It must be Safari — Chrome on iOS can't install web apps.

You get an icon on the home screen. Tapping it opens the sheet fullscreen with no
browser bars, and it works on airplane mode after the first load.

### Updating the app later

Edit the files, then `git add -A && git commit -m "..." && git push`. Devices pick up
the new version the next time they open the app with a signal — no reinstall, and your
sheet data is untouched.

---

## Running it locally instead

Double-clicking `index.html` mostly works, but browsers restrict some things on
`file://` URLs. To run it properly on the laptop:

```bash
python -m http.server 8765 --directory vtm-sheet-app
```

Then open `http://localhost:8765`. (There's a `.claude/launch.json` in the parent folder
so Claude Code can start this for you.)

---

## How it works

### Three layers, kept separate

| Layer | What's in it | When it changes |
|---|---|---|
| **ST sheet** | Everything from the ST's JSON block | Only when you paste new data |
| **Your edits** | Overrides, additions, hidden rows | When you unlock and change something |
| **Player layer** | Health, willpower, blood, inventory, notes, rolls, log | Whenever you tap something |

Your edits never touch the ST block underneath. An edited value shows an `EDITED` mark
and a `revert` button that puts the ST's value back. Things you add show `YOURS`.

### Pasting new data

Paste the ST's JSON into the box at the bottom, press **Load sheet data**. You get a
review screen first: every section lists what changed, and you choose **take ST** or
**keep mine** per section. Nothing commits until you press Apply.

If the ST changed something you'd also edited by hand, the review flags it explicitly
before you commit. If a block arrives with rows the app can't read a name out of, it
says so and refuses to load until you confirm — a shape mismatch can't silently blank
the sheet.

The player layer survives a paste no matter what you choose.

### Undo

**Undo / history** next to the paste box holds the last ten sheets this slot has had.
Restoring one puts the current sheet into history first, so undo and redo are the same
button and nothing is ever lost. Your player layer isn't touched by a restore.

### The lock

The sheet is read-only by default so you can't fat-finger a rating mid-scene. The
🔒 button in the top bar unlocks everything — dots, text, notes, threads, materiel.
A faint diagonal hatch across the background tells you at a glance that you're unlocked.

### Slots

The **Slots** button holds as many characters as you want, PC or NPC, each with its own
sheet, edits, and player layer. Sparse sheets render clean — an NPC with three traits
and a note shows three traits and a note, not a page of empty boxes.

### Experience log

A ledger of when each dot was bought, sitting under Merits & Flaws. It fills itself
three ways:

- **Automatically**, every time you load ST data — any rating that went up is recorded
  with the session tag, the change, and the XP cost if the ST wrote one in that trait's
  note.
- **Scan sheet notes**, which reads purchases the ST already spelled out in the current
  sheet (`"raised 2→3 at S41, 8 XP"`, `"new at S41, 3 XP"`). Use it once to seed the log
  from a sheet you've already loaded. Running it twice adds nothing.
- **By hand** — every field is an editable text box, and `+ Add entry` makes a blank row.
- **By import** — paste a block shaped `{"__vtm":"xplog","entries":[...]}` into the
  right-hand box in the Data panel and press **Import block**. It asks whether to replace
  the existing log or add alongside it, skipping exact duplicates. **Export log** writes
  the current log back out in the same shape, which is how you move it between devices.

### Spending XP

The log is the wallet. Awards add, purchases subtract, and **banked = earned − spent**.
The ST's own `xp` block is displayed underneath as a cross-check and says plainly when
it disagrees with your ledger — it is never the source.

**A dot cannot rise except by being bought.** With the sheet locked, tapping a dot above
a trait's current rating opens a spend dialog: it shows the trait, the change, your
banked total and what it becomes, and a cost suggested from the V20 chart (p.124, priced
at current rating) that you can overwrite. Nothing moves until you confirm — and if the
cost exceeds what you have banked, Confirm is disabled and it tells you the shortfall.
Tapping a dot *below* the current rating offers to undo that trait's most recent
purchase and refund it.

Bought ratings are marked `BOUGHT` rather than `EDITED`. Traits the ST never listed —
a zero-dot Ability from the V20 roster — can be bought too; the row is created on
purchase.

Unlocking the sheet still edits dots freely. That mode is for correcting ST data and
deliberately bypasses the gate, so it does not touch the ledger.

`+ Add XP` records an award. An imported ledger is all spends, so until an award is
logged the bank sits negative and every purchase is blocked — when that happens the
Experience box says so and offers a one-tap button to add the ST sheet's earned figure.

The cross-check against the ST's `xp` block distinguishes the ordinary case from a real
problem: spending more than the sheet knows about is expected once you buy something,
while a mismatch in *earned*, or a ledger short on spends, is called out in red.

Columns are Write, Trait, Change, XP, Pricing/note, and a running banked balance. Rows sort by the
first session number in the Write tag, so a banded tag like `S19-S28` files under 19.
**Oldest first / Newest first** flips the display; the running total is always computed in
write order, so the last chronological row is the true total either way.

It lives in the player layer, so it survives a sheet reissue. The totals line shows what
you've logged against what the sheet claims was spent overall, so a gap is visible
without anything being computed for you. Vinculum is excluded on purpose — those dots
aren't bought.

One wrinkle: entries captured by a paste are not removed if you then undo that paste
from **Undo / history**. Delete them by hand if you back one out.

### Specialties

Only Attributes and Abilities carry a specialty, and only at **4 dots or more**. Below
that rating, and on Backgrounds, Virtues, Disciplines and Vinculum, no specialty field is
offered. If an ST block puts a specialty somewhere the rule doesn't allow, the text is
still shown — as a plain note rather than a parenthesised specialty — so nothing is lost.
Buying a trait up to 4 opens its specialty slot.

### Blood

Twenty checkboxes, fixed — the app does not scale the pool to generation. Tap a box to
fill or empty to that point, exactly like Willpower, with a gap every five so the count
reads at a glance. The ST's blood note still shows underneath. You manage the number.

### Dice

Pick a number of d10s, set the difficulty, roll. Faces only — nothing is counted for
you. Dice at or above the difficulty are inked green; 10s stay black and 1s stay red
regardless of difficulty, so the faces that matter most never blend in. Pool and
difficulty are remembered per character. Every roll goes into the change log.

---

## Backups — read this once

**Storage is per-device.** The phone and the laptop do not share. If you paste S38 on
your phone, the laptop still shows S37.

The app saves to the device automatically, but browser storage can be cleared by the
browser, by iOS reclaiming space, or by you clearing site data. Before anything drastic
(new phone, clearing history), use **Download full backup .json** at the bottom. To
restore, paste the file's contents into the right-hand box and press **Import block**.

`Export this slot` moves one character between devices. `Export all slots` does the lot.

---

## The JSON the app expects

The ST's block, e.g. `vtmmitchdaniels_SHEETDATA_S37_2026-08-23.json`. Known top-level
keys, all optional:

```
schema, issuedBy, asOf, identity, attributes, abilities, disciplines, disciplineNote,
backgrounds, virtues, humanity, willpowerPerm, bloodNote, meritsFlaws, xp, vinculum,
vinculumNote, bond, anchor, materiel, threads, scene, sheetNotes
```

Anything else lands in an "Additional (new fields)" section rather than being dropped,
so the ST can add a key without the app needing a change.

Traits accept either shape — a list or a map — and the name/rating keys can be spelled
several ways: name as `n`, `label`, or `name`; rating as `d`, `rating`, or `dots`;
specialty as `spec` or `specialty`. So `[{"n":"Brawl","d":3}]`,
`[{"label":"Brawl","d":3}]`, `{"Brawl":3}` and `{"Brawl":{"rating":3}}` all work.
Materiel accepts `item`/`status` as well as `n`/`note`, and `xp.deferred` is folded into
the XP note. Attributes accept grouped
(`{"Physical":[...]}`) or flat (`{"Strength":2,"Dexterity":3}`). Clan, generation, and
individual Discipline lines accept `{"state":"named"|"working"|"redacted","label":"..."}`;
`redacted` renders as a black bar with the dots still visible.
