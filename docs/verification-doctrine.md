# The verification doctrine

How to know an AI-agent-built system is *actually* working — extracted from
operating a real production funnel (ads → landing → checkout → delivery)
where every layer was written by LLM agents and every failure mode below
happened at least once.

## The honest question

**"Is everything 100% fine?" cannot be answered.** What can:

> Every surface the user touches is verified at its point of consumption,
> every known failure has a check we've *proven* turns red, and the remaining
> gaps are written down with a name and a reason.

All three clauses matter. A green dashboard without the third clause is how
you ship the same incident eight times.

## Point of consumption, not point of production

The single most repeated failure class in agent-operated systems:

- the config was fixed → the deployed artifact wasn't
- the file in the repo was correct → the file being SERVED was old
- the PDF was regenerated → the landing page still made the deleted claim
- the code was written → the handler never compiled in a real browser

**Verify the thing the user receives.** Fetch the live URL. Execute the live
handler. Hash the served binary against the intended one. An agent reporting
"done" is reporting intent, not outcome.

## Tests that bite

A verifier that never saw red is a decoration. For every check:

1. Reinject the original bug (or a faithful reproduction).
2. Watch the test fail.
3. Restore the fix. Watch it pass.
4. Only then does the incident count as covered.

This catches two embarrassing classes: tests pointing at files that don't
test the claim (we found seven), and checks that pass on empty input
(`[].every()` is `true` — every aggregate check needs a floor).

## Declared gaps beat invented greens

Some things can't be automated (a human reviewing ad previews; an external
dashboard with no read API). Write the gap down with a reason, print it in
every preflight run as *information, not failure* — painting known debt red
trains people to ignore red.

## The adversarial second model

Your verifiers only find what you already knew to look for. Before anything
reaches production, a **different** model (we use OpenAI Codex against a
Claude-built system) reads the diff cold, with:

- the real preflight output (or it wastes the round rediscovering it),
- the declared gaps list,
- and — when reviewing a fix for its own finding — an explicit note about the
  conflict of interest: *don't approve the fix because the diagnosis was yours.*

In our production use this gate rejected a diff the primary model considered
ready (5 blockers, one introduced *by* the fix), and its "re-check the data
store before deploying" instruction caught a schema-compat bug that would
have emailed real customers five duplicates. The asymmetry is the value:
**we run things; the reviewer reads things.**

## Spend safety for agent-operated accounts

Any command that can spend money:

- takes NO default targets — "all" as a default is how an agent 6× your budget;
- requires a `--confirm` flag as a second key;
- writes an append-only log BEFORE the API call (worst case: "recorded and
  pending", never "spent and unknown");
- puts the safety net ON before enabling (hard budget caps enforced by the
  platform, end times on every object, re-read after write);
- and re-reads **the field that answers the question** (`effective_status`,
  not `status`) after every mutation.

## The blindness question

After every incident, ask: **why did no verifier see this?** Not "what broke"
— what *class of check* was missing. That answer generalizes; the fix alone
doesn't. Keep the answers as data (see `incident-book/`), because prose
can't be queried and the next agent session won't reread 3,000 lines of
handoff notes.
