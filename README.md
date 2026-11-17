# agent-ops-verification

**Run AI-agent-built systems in production without lying to yourself.**

A field-tested toolkit for **AI agent operations**: verification doctrine,
incident analysis for **agentic workflows**, and QA tooling for AI-generated
output (video, images, ad creatives, landing pages). Extracted from a real
production system — an autonomous content/commerce pipeline operated with
**Claude Code** and adversarially reviewed with a second model (**OpenAI
Codex**) before every deploy.

Built and maintained by **Mauro Spigolon**, AI Enablement Lead, Mendoza,
Argentina (GMT-3). Native Spanish, fluent English.
Contact: [LinkedIn](https://www.linkedin.com/in/maurospigolon/) · GitHub: [@AISurfer10](https://github.com/AISurfer10)

> **The rule that orders everything: verify at the point of consumption, not
> the point of production.** A correct config file is not a correct production
> system. A green test suite is not a working funnel. The surface the user
> touches is the only surface that counts.

## Who this is for

- Teams shipping **LLM agents / agentic workflows** (Claude, GPT, Gemini) into
  production and discovering that "the agent said it worked" is not evidence.
- **AI enablement / AI adoption** roles: turning agent failures into
  structured, actionable feedback for model and workflow improvement.
- Anyone doing **RLHF-adjacent evaluation** work who wants a repeatable
  process for judging AI output instead of vibes.

## What's inside

| piece | what it does |
|---|---|
| [`docs/verification-doctrine.md`](docs/verification-doctrine.md) | The full method: point-of-consumption checks, tests that *bite* (bug reinjection), declared gaps over invented greens, adversarial second-model review before deploy |
| [`incident-book/`](incident-book/) | A YAML schema for AI-agent incident analysis. The key field is `blindness`: *why no verifier caught it*. Includes real (anonymized) incidents and the ratchet test pattern that keeps the book honest |
| [`tools/distill-reference.mjs`](tools/distill-reference.mjs) | Ad/video reference distiller: extracts keyframes (ffmpeg) + word-level transcript (ElevenLabs Scribe) so an LLM can analyze mechanism, timing and script — not just frames |
| [`tools/contrast-check.mjs`](tools/contrast-check.mjs) | WCAG contrast math + accessible-ink derivation for AI-generated pages. Born from a real incident: 43 text checks all green while the price was unreadable — because every check read the DOM and none *looked* |
| [`docs/patterns.md`](docs/patterns.md) | Smaller patterns: append-only campaign observability, AI-video QA gates, spend fuses for agent-operated ad accounts |

## The five rules that cost the most to learn

1. **Comparing text is not verifying behavior.** If the surface is code that
   must execute, the check must execute it. (A broken `onclick` contained the
   string `fbq(` — every text check passed; the handler never compiled.)
2. **`[].every()` is `true`.** Every aggregate check needs a floor count, or
   deleting the data passes the check.
3. **Read the field that answers the question.** "Is it paused?" is not
   answered by `status`; it's answered by `effective_status`. Agents love the
   field that's easiest to fetch.
4. **Absent is not approved.** If the API didn't return the field, you may not
   claim it's off. If a dataset returns empty on error, your dashboard invents
   the most expensive possible lie: zero.
5. **A verifier that never saw red is not a verifier.** Reinject the bug and
   watch the test fail, or you have a decoration.

## Stack / keywords

AI agents · agentic workflows · LLM ops · AI evaluation · RLHF · QA automation
· Claude Code · OpenAI Codex · Meta Ads API · Cloudflare Workers · webhook
reliability · idempotency · WCAG · ffmpeg · speech-to-text · TypeScript ·
Node.js · Vitest

## License

MIT. Use it, adapt it, ship it. If it saves you an incident, a message on
[LinkedIn](https://www.linkedin.com/in/maurospigolon/) is appreciated.
