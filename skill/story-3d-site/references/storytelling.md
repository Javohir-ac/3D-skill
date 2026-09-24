# Storytelling

A story site is a **short film the visitor plays**. People forgive rough edges in a
story that makes sense; they leave a beautiful site whose chapters don't connect.

## Contents
1. The arc (10 beats → 7 chapters)
2. The hero object (one metaphor)
3. Linking chapters: cause → effect, carry something over
4. Copy rules
5. Rhythm inside a chapter
6. Example arcs by topic
7. Case study: why.zero.university (what to take, what to fix)

## 1. The arc

The proven dramaturgy (Zero, most Awwwards story sites):

| Beat | Purpose | Template scene | Mood |
|---|---|---|---|
| 0. Hands-on opening | the visitor *does* something; brand in second 1 | intro overlay (frost / draw / notifications) | curiosity |
| 1. Promise / origin | where it all starts | `intro` | light, calm |
| 2. Dream / care | what we want, what is precious | `dream` | airy, warm |
| **Gate 1** | the visitor triggers the turn | hold → `breakToDark` / `burnThrough` | tension |
| 3. Break / fire / conflict | the problem hits (or the transformation) | `fracture` | dark, red/orange |
| 4. Evidence | numbers, proof, what goes wrong elsewhere | `evidence` | dark, dense |
| 5. Why us | resolve gathers into a single point | `charge` | darkest, one light |
| **Gate 2** | the visitor releases it | hold → `implodeToLight` | explosion |
| 6. Reveal | the brand / product appears | `reveal` | open sky, relief |
| 7. Finale | explore the product, CTA | `finale` | calm, clear |

The two gates are **mirror images**: gate 1 takes us down (dream → problem),
gate 2 takes us up (problem → solution). Not every brief needs a villain: for a
craft product the "break" can be a *transformation* (coffee: the bean cracks in
the fire — "first crack" — and that is what makes it good).

## 2. The hero object

One object lives through **every** chapter and changes form. It is the story's
metaphor, and it must be **recognisable in the first frame** without reading.

- Zero: a hand — ice hand → god's hand → middle finger → statue → banknote portrait.
- Demo "Tong": a coffee bean — raw green bean (ripening) → picked by hand →
  cracks in the fire → far and small (evidence) → glowing core → roasted bean over the city.
- Time/productivity: a glass orb with a clock inside — ticking → reached for →
  cracked, hands stop → spinning fast (evidence) → calm again.
- Ecology: a seed → sprout → burnt/dry → bare → spark → tree over the city.

Checklist: Can a stranger name it in one word? Can it plausibly *change* (crack,
burn, glow, grow, shrink)? Does its final form express the product?

## 3. Linking chapters

The #1 user complaint on an earlier draft: "there is no logical link between
chapter 1 and 2". For every boundary, write the link explicitly in the treatment:

- **Cause → effect**: chapter N+1 must be what *happens because of* chapter N
  (ripe → picked → roasted; promised → believed → broken).
- **Carry something across the cut** — at least one of:
  - the **object** (same hero, same position at the end/start of the chapters),
  - the **camera move** (the camera follows the rising orb *into* the clouds of the
    next chapter — one continuous shot; the boundary colour is the inside of a cloud),
  - the **word** ("…there would be *T*ime" → next chapter opens "*T*ime for the trip").
- Hide hard swaps inside gate transitions (the screen is black/white/covered at
  `jump()`), never in plain scrolling.

## 4. Copy rules

- Few words, big type. A chapter has 2–5 lines; each line is visible in its own
  `at` window, so the reader reads one thought at a time.
- One **script swash capital** per line (`*T*ime`), on the word that carries the
  meaning. Mix serif display + script + a small mono caption line.
- The first line of each chapter is `tag: "h2"`; the very first line of the site `h1`.
- Numbers get a source (`stats[].source`), shown as visible footnotes.
- Write in the site's language; keep punctuation typographic («», —, ’).
- Tone matches the audience. Shock (Zero's middle finger) works for young
  audiences and can repel corporate ones — ask if unsure.

## 5. Rhythm inside a chapter

Something must happen every **10–15 %** of chapter progress: a line appears, a
beat (`pulse`, `burst`, `flash`, `shake`), a camera move, an object entering.
Chapter `length` (in viewport heights) ≈ 2–3.5; the finale is short (~1.4).
Gates sit at `at ≈ 0.82–0.9` of their chapter.

## 6. Example arcs

**Coffee brand (demo "Tong", Uzbek):** "Hammasi bitta *D*ondan" (one bean, 1800 m,
nine months under sun and fog; an hourglass) → hand-picked in the clouds, only the
ripe ones → gate → fire, 220°, the bean cracks ("first crack"), chaff flies →
numbers on glass: 12 min roast, 7 days best, 2 years on a shop shelf; a calendar
of shelf days burns → "that's why we made Tong" (glowing core) → gate → through the
clouds to the city: "roasted fresh every day, delivered in 24 h" → choose your cup
(Espresso / Filter / Latte hotspots).

**Productivity app (original demo "Aurora"):** you were told there would be *T*ime
→ time for the trip, the book, the people → gate → *B*ut. Someday never comes →
screen-time numbers; a calendar of crossed-out days burns → that's *W*hy we exist
→ gate → introducing Aurora, real hours back → pick your first hour.

**Developer portfolio:** a blinking cursor → first lines of code grow into a
structure → gate → the crash (red, glitch) → numbers: shipped projects, users,
uptime → the one principle → gate → the work, as a city of projects → contact.

**Ecology campaign "Ildiz" (tested with this skill, Uzbek):** hero = an acorn.
"Every forest starts from one *S*eed" (hourglass: a hundred years to grow) → the
wind lifts it into the clouds, a hand reaches to catch it: "someone *P*lants it" →
gate `burnThrough` → wildfire, the acorn cracks, ash flakes → numbers on glass;
a "days without rain" calendar burns → "that's why we *P*lant again" (green core)
→ gate `implodeToLight` → through the clouds onto a green city (`parks: 0.4`) →
choose where to plant (park / school / volunteer). Intro: the circle becomes a
tree cross-section.

## 7. Case study: why.zero.university

Take: hands-on intro (draw a zero = the brand), one metaphor (the hand), colour
per chapter, two mirrored TAP HOLD gates, cinematic transitions (strobe glitch →
black → a hand breaks the darkness into red shards; desaturate → hard cut →
morph), statistics on broken glass, clouds, the finale city where every building
is a project card → Join.

Fix: 15–20 s loader (keep < 5 s), unclear hold duration (show progress), no way
back (chapter nav), text only in canvas (HTML copy for SEO/a11y), no reduced
motion, statistics without sources, heavy on weak devices.
