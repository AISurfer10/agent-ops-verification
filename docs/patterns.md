# Smaller patterns

Compact write-ups of patterns that don't need a whole tool.

## Append-only campaign observability

Ad platforms aggregate and then **discard** fine-grained breakdowns
(age×gender, hourly, per-placement). If an experiment runs 7 days and you
only look at the end, the interesting structure is gone.

Pattern: a read-only snapshot script (2–3 API calls) appending one JSON line
per run to a JSONL nobody edits. The readout happens once, at the end,
against pre-written decision rules — *looking is not deciding* — but the
series exists. Bonus rule: never poll; scheduled sparse reads. Ad platforms
rate-limit aggressively and a blocked API account mid-experiment is worse
than missing a datapoint.

## AI-video QA gate

AI video generators fail in ways text checks can't see: wrong language,
wrong accent, compressed diction when the script doesn't fit, dropped words
at segment seams. Gate every generated clip before spending more credits:

1. Extract audio (ffmpeg) → word-level STT transcript.
2. Assert: expected language; no function words from the wrong language;
   words-per-second within tolerance per segment (fast segments = the model
   compressed the read); every scripted keyword present.
3. Accent quality is NOT text-detectable — that stays a declared human gap.

Run it after every segment, not after assembling: extension-based generators
force you to redo everything downstream of a bad segment.

## The two-schema absence trap

When you split or migrate state, the *absence* of a key changes meaning.
Old schema: absent = done. New schema: absent = never started. Any reader
deployed against mixed data will lie in one direction or the other.
Rules: (a) make readers schema-aware before the writer changes, (b) census
the real data store immediately before deploying — premises like "no legacy
rows exist" expire, and an inherited premise is only as fresh as its last
measurement, (c) prefer compatibility code over migration scripts when
writes can happen during the deploy window.

## Retro aesthetics as AI camouflage (creative production)

For AI-generated video ads: a deliberately stylized period look (VHS, 70s
sitcom, film grain) *absorbs* generation artifacts that read as uncanny in
realistic footage. The format eats the pipeline's defects. Pair with
era-accurate props for the target audience's nostalgia window — and note
that period props are often EASIER to get right than current ones.
