# Owner Launch Dashboard

Date: 2026-07-01 (Fable 5 launch acceleration pass)

## Where the launch stands in one look

| Question | Answer |
|---|---|
| Is anything unsafe happening? | No. All gates closed, production untouched, nothing displayed, nothing committed by this pass |
| What is finished? | Corpus built and loaded to preview (gated); all metadata queues turned into reviewable candidate decisions; schema, gates, RLS, and audit design verified |
| What is the single bottleneck? | Human review of the candidate decisions (E14C). Your approval O1 starts it |
| What is the fastest honest path to internal QA? | O1 today; corpus-admin review; patched preview reload (your signature O6); internal-QA display tier (O2); QA route build (O7); harness green; launch (O8) |
| What will you never be asked to shortcut? | Row-by-row review, reload vs display separation, two green harness runs, production prohibition |

## Decisions on your desk

| ID | Decision | Recommendation | When |
|---|---|---|---|
| O1 | Approve E14C review execution | Approve | Today |
| O2 | Internal-QA display tier | Narrow default (statutes and rules only) | Before reload completes |
| O3 | TRE filter mechanism | App-layer now, RPC later | Before integration build |
| O4 | Lexis black-letter display ruling | Your judgment or counsel | Before any display |
| O5 | Fence rehearsal migrations | Approve | Soon, small commit |
| O6 | Preview reload | Defer until E14C evidence | After review |
| O7 | Integration build | Defer until reload re-QA | Later |
| O8 | Internal QA launch | Defer; final gate | Last |

## Numbers that matter

- 6,590 corpus chunks staged, 0 displayable (by design)
- 38 identity, 54 effectivity, 439 signoff decisions gate the first displayable content
- 4,198 chunks await sampled extraction QA (family-level sampling keeps this manageable)
- 2,014 DCS chunks stay reference-only; 2,392 restricted chunks stay non-displayable
- 0 embeddings, 0 app connections, 0 production contact: all intentional

Full decision text: `../15_OWNER_DECISION_PACKET.md`. Full plan: `../14_PHASED_LAUNCH_RUNWAY_TO_INTERNAL_QA.md`.
