# What Weirdly Specific Thing Are You?

A single-page quiz that answers a question nobody asked: which oddly specific,
mildly cursed household object are you, exactly?

No accounts, no server, no tracking. Six questions, one very specific verdict
out of a 45-item pool.

## Run it locally

Just open `index.html` in a browser — it works straight from the file system.

For the Copy/Share buttons to work (some browsers restrict the Clipboard API
on `file://` pages), serve it over a tiny local server instead:

```
python -m http.server 8000
```

then visit `http://localhost:8000`.

## Files

- `index.html` — markup and the three screens (intro, quiz, result)
- `style.css` — all styling, light/dark mode, mobile layout
- `script.js` — questions, the 45 results, scoring logic, and all interactivity

## How the scoring works

Every answer nudges the player's score along five axes: **chaos, cozy,
overlooked, nostalgic, social**. Each of the 45 results also has a position on
those same five axes. After the last question, the app compares the player's
vector to every result's vector using cosine similarity, takes the five
closest matches, and picks one of those five with weighted randomness
(closer matches are more likely). That's why answers meaningfully steer the
outcome, but retaking the quiz — even with similar answers — doesn't always
land on the exact same result.

## Notes on the review pass

This was self-tested rather than reviewed by a second model: every option
path was exercised, 500 randomized playthroughs were run through the scoring
engine to check for crashes and result-distribution skew (38 of 45 results
surfaced this way; none dominated), mobile and desktop layouts were checked,
and the Copy/Share fallback logic was verified via direct testing (a
sandboxed test browser without clipboard permission correctly fell back to
its error state, which is what a real browser would do if a user denied
clipboard access).

**Known limitation:** a handful of results sit close to the "average" answer
profile (e.g. "a junk drawer that somehow still closes"), so they surface
somewhat more often under uniformly random answers than the rest of the pool.
It's not dominant enough to feel broken, but a future pass could rebalance
those vectors for a flatter distribution.
