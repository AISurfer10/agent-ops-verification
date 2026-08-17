# The incident book

A queryable record of every failure that reached (or nearly reached) a real
user of an AI-agent-operated system — designed so the knowledge stays **data**,
not prose. Prose can't be queried. Nobody can answer "which known failure
modes have a check, and which checks are *proven* to fire?" by re-reading
3,000 lines of handoff notes.

## The schema

Each incident has four non-decorative fields:

| field | why it exists |
|---|---|
| `surface` | Where the **user** would have seen it — not where the code was |
| `blindness` | **Why no verifier caught it.** The teaching field, and the one AI-agent teams skip. An agent's output looked right; *what class of check was missing?* |
| `verifier` | The file that catches it today, or `null` + `reason` — a **declared gap beats an invented green** |
| `proof` | The test that demonstrates the check *bites* (fails with the bug reinjected), or `manual` + reason |

See [`schema.yaml`](schema.yaml) and [`examples.yaml`](examples.yaml) — real
incidents, anonymized.

## The cycle

```
something breaks
  → 1. write the incident entry BEFORE fixing (especially `blindness`)
  → 2. fix it
  → 3. write the test that FAILS with the bug reinjected
  → 4. wire the verifier into the preflight (a check you must remember to run protects nothing)
  → 5. adversarial pass: what NEW class of failure does this fix open?
```

Step 5 is what turns a fix into a process improvement. In our production use,
step 5 (run with a second model as adversarial reviewer) caught a blocker
*inside* a fix for a critical bug — twice.

## The ratchet

The count of incidents with **automated** proof may only go up. It's a number
in the YAML, enforced by a test; lowering it requires editing the number where
it shows in the diff.

Why a count and not a fraction: our first attempt was a fraction, and it broke
on first contact — adding an honestly-manual incident *lowered* the fraction
and turned the test red. **A mechanism that punishes honesty gets bypassed.**
That lesson is the whole design.
