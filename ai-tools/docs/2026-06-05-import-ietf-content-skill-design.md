# Design: RFC-import skill for RFC 6514bis

**Date:** 2026-06-05
**Status:** Approved design (pre-implementation)
**Author:** Rishabh Parekh

## Problem

A majority of the work items in `WorkItems.md` are about pulling the *core
content* of existing IETF RFCs and drafts into `rfc6514bis.md` (e.g. RFC 6515,
6625, 9081, 7441, 8534, 9573). This is a recurring, judgment-heavy, error-prone
task: deciding what counts as "core," judging whether a document is even
appropriate to fold in, mapping content to the right place in a large existing
draft, and editing in kramdown-rfc while keeping references and IANA citations
correct.

This skill captures that workflow once so it is consistent across contributors
and across AI tools.

## Hard requirements

- **Platform-agnostic / generic.** Collaborators use AI tools other than Claude
  Code (Cursor, Copilot, Gemini CLI, plain chat, etc.). The deliverable must be
  usable by any of them.
- **Single IETF document per run.** Input is one, and only one, RFC number or
  Internet-Draft name. Multi-document batch import is out of scope.
- **The "core / too-much" judgment is ambiguous and must be surfaced.** The
  skill must present its assessment with rationale and let the user decide;
  it must not silently decide.

## Deliverable & layout

A single `SKILL.md` following the open Agent Skills standard. Frontmatter is
limited to the portable fields (`name`, `description`); no Claude-proprietary
keys (`allowed-tools`, `model`, `license`, etc.), so any standard-aware tool can
consume it.

```
ai-tools/import-ietf-content/
  SKILL.md                      # lean workflow spine + gates; defers detail to references/
  references/
    core-taxonomy.md            # include / exclude / "too-much" heuristics (overridable default)
    kramdown-editing.md         # reference-rewrite, IANA cite-not-reallocate, kramdown conventions
    decision-record-template.md # per-document decision record format
  scripts/
    fetch-source.sh             # xml-first fetch + html/txt fallback (optional helper)
  decisions/
    <doc-id>.md                 # one decision record per document, created at runtime:
                                #   rfc<N>.md for RFCs, <draft-name>.md (no -NN version) for drafts
```

For Claude Code auto-triggering, a **local, git-ignored** symlink
`.claude/skills/import-ietf-content -> ../../ai-tools/import-ietf-content` is
used. Nothing Claude-specific is committed to the shared IETF repo.

### Why a single skill (not multiple skills or sub-agents)

- Sub-agents and cross-skill invocation are tool-specific (not in the open
  standard); making them load-bearing would break portability — the core
  requirement.
- The workflow is linear and single-context (each phase feeds the next on
  shared state); there is no parallelism for sub-agents to exploit, and
  splitting phases across skills would force lossy context hand-offs in a
  correctness-sensitive task.
- Size is managed the portable way: a lean `SKILL.md` spine plus
  progressive-disclosure `references/*.md` read on demand.
- The one real context-bloat risk is reading the full source document into the
  main context to do extraction. The portable mitigation is the optional
  `scripts/fetch-source.sh` helper. As a Claude-only, clearly optional note, the
  SKILL.md may suggest running **P1+P2 (fetch + extract) in a sub-agent that
  returns only the compact core-content inventory**, so the large source text
  never enters the main context — never required. (Running only the fetch script
  in a sub-agent buys little: the document would still have to return to the main
  context; the win is doing the extraction in the sub-agent.)

## Input contract

- One RFC number (e.g. `RFC6625`) or one Internet-Draft name.
- For drafts, resolve the **latest version** via datatracker (drafts are
  versioned; RFCs are stable).
- Source fetch prefers `.xml` (clean section / reference / encoding structure),
  falling back to `.html` then `.txt`.
- Reject input naming more than one document.

## Workflow spine (SKILL.md body)

Six phases with three hard human gates (P3, P4, P5).

1. **P1 — Fetch & parse.** Resolve the document, fetch `.xml`-first (fallback
   `.html`/`.txt`), optionally via `scripts/fetch-source.sh`. Produce a working
   representation (sections, references, IANA-relevant encodings).

2. **P2 — Extract core content.** Apply `references/core-taxonomy.md` to produce
   a **core-content inventory**: each procedure / encoding / IANA point
   classified core vs non-core.

3. **P3 — Import-or-skip assessment.** First present a concise overview of the
   source document (what it specifies, what it changes vs. RFC 6514, its shape),
   then apply the "too-much" signals to produce a recommendation plus rationale.
   - **Gate 1 (human decision, authoritative).** Present recommendation +
     rationale. The user decides.
   - **Override handling.** The skill's output is a recommendation only; the
     user's decision wins. When they diverge (notably skill-says-skip but
     user-says-import, and the reverse), record the **override and the user's
     rationale**, then proceed along the user's decision. The skill does not
     argue; it logs the disagreement.
   - If the resolved decision is **skip**: complete the decision record (skip +
     rationale, plus override rationale if any), update `WorkItems.md`, and
     **stop**.

4. **P4 — Section mapping.** Produce a mapping table in which every P5 edit
   appears as a row (completeness). Each row: provenance → target in
   rfc6514bis.md (heading + line range; extend or new) → the edit. Provenance is
   typed — a source citation for imported content, or a derivation reason for
   editorial/consequential edits — but **normative additions (MUST/SHOULD,
   encodings, IANA) MUST cite source text**. Significant/structural changes may
   be a coarse row plus a short narrative. Also ask whether the change warrants
   bumping the draft revision in the `docname` frontmatter (user decides).
   - **Gate 2 (human approval).** Present the mapping; get approval before
     editing.

5. **P5 — Edit `rfc6514bis.md`.** Apply edits per
   `references/kramdown-editing.md`, then present the diff of the actual edits.
   - **Gate 3 (human approval).** Approval of the P4 mapping is not approval of
     the edit (the applied text can differ from the preview); get sign-off on
     the diff before P6. Recommend (do **not** run) a dedicated git branch.

6. **P6 — Finalize.** Complete the decision record, update `WorkItems.md` status
   with a pointer to the record, and surface the human-gated flags as explicit
   TODOs (see below).

## Core taxonomy (references/core-taxonomy.md)

Shipped as **default, overridable guidance** (explicitly marked as a starting
heuristic the agent and user may override per document).

- **Core — import:** wire encodings (NLRI route types, BGP path attributes,
  extended communities, flags/fields); normative origination / reception /
  processing procedures (the MUST/SHOULD behavior); dependent IANA code points;
  interaction rules with existing RFC 6514 procedures.
- **Non-core — leave behind, cite the source RFC instead:** motivation,
  use-case narrative, requirements / background, examples and illustrative
  walk-throughs, deployment / operational discussion, history, and restatements
  of text already in 6514bis.
- **"Too-much to import" signals → recommend *skip*:** the document is really a
  separate feature/architecture rather than an augmentation of RFC 6514's base
  machinery; the normative core alone would bloat 6514bis disproportionately;
  heavy dependency chains on yet other specs. (RFC 9573 is the canonical
  counter-example from `WorkItems.md`: lots of use-case/motivation text, but a
  small core procedure — pull just the procedure.)
- **Scope-trim within core:** intersect "core" with 6514bis's scope (RFC 6514,
  MVPN over MPLS/BGP IP VPNs). When the source spec also covers an adjacent
  technology (e.g. EVPN), import only the in-scope slice and cite the
  remainder. (Observed in the RFC 9573 dry-run: its common-label mechanism is
  specified jointly for MVPN and EVPN.)
- **Dependency drag:** imported core may rest on a substrate RFC not yet
  incorporated here (e.g. RFC 7902's PMSI Tunnel Attribute "Extension" bit
  underlying RFC 9573's DCB-flag). Identify substrate dependencies; decide
  cite-vs-import per dependency (prefer citing to keep scope bounded); surface
  each as a decision-record flag.
- **Delta imports:** when the core enhancement modifies an existing 6514bis
  procedure, the imported material is often a delta — mostly a restatement of
  text already present plus a small new normative behavior. Inventory only the
  new normative behavior as core; treat the surrounding restatement as non-core
  and extend the existing text in place. (Observed in the source-active-route
  draft dry-run.)

## Editing & correctness rules (references/kramdown-editing.md)

- **References:** rewrite citations in the imported text to inline kramdown —
  `{{!RFCxxxx}}` (normative) / `{{?RFCxxxx}}` (informative),
  `{{!I-D.draft-name}}` for drafts. Mechanical and automatic.
- **Normative vs. informative, and self-references:** a reference is normative
  (`{{!...}}`) if a MUST/SHOULD depends on a value/definition it supplies, even
  when the full mechanism is not adopted; a source citation to the base RFC
  being revised becomes a self-reference on import — rewrite it as in-document
  prose/cross-reference, do not keep the external citation.
- **Source reference errors:** if the source document cites a wrong or
  self-inconsistent reference (e.g. a citation pointing to an unrelated RFC),
  flag it for the user during P1; do not silently propagate it.
- **IANA code points — cite, never re-allocate.** Imported encodings often carry
  IANA-assigned code points (e.g. RFC 7441 PMSI Tunnel Type value; RFC 8534
  Leaf-Information-Required flag bits; RFC 6625 wildcard encodings). 6514bis must
  **cite the existing allocation**, not phrase it as "this document
  defines/requests codepoint N" (that would request a duplicate allocation).
- **kramdown conventions:** match the existing draft — heading `#`-style (no
  space), artwork indented ≥4 spaces or fenced with `~~~~~~~~~~~`, spaces not
  tabs, no trailing whitespace, file ends in a newline.
- **Cross-references:** draft headings often lack `{#anchor}`s and literal
  numbers — cite targets by heading text + line range, flag whether to add an
  `{#anchor}` for new cross-referenced text, and verify prose "Section N"
  cross-references via the author-tools render (no local build).
- **IETF prose & normative style:** write imported text in the measured RFC
  register and, above all, MATCH THE SURROUNDING SECTION of rfc6514bis.md — its
  voice, the document's already-defined terms (PE, P-tunnel, C-multicast,
  x-PMSI, etc.), and its RFC 2119/8174 keyword usage. Do not rely on the
  model's pretraining to supply RFC style (the kramdown-rfc *source* idioms are
  not in the published-RFC corpus anyway); imitating the adjacent draft text is
  model-agnostic and keeps output consistent across LLM vendors.
- **Human-gated, never auto-applied (logged in the decision record):**
  - the `obsoletes` / `updates` frontmatter decision (WG call) — for an **RFC**
    import the bis may obsolete/update that RFC; for a **draft** import
    "obsoletes" does not apply (a draft is not a published RFC), so instead note
    the draft's status (WG/active vs individual/expired) and that its own update
    of RFC 6514 is subsumed by the bis. For **either** input type, if the source
    `updates`/`obsoletes` RFCs *other than* 6514 (e.g. RFC 9573 also updates
    7432 and 7582), flag whether the bis must carry those relationships for the
    imported, scope-trimmed content. The skill records these relationships per
    import and does NOT reconcile obsoletes/updates chains across imports — that
    is a later, document-wide audit of all decision records by the user;
  - any IANA registry **reference-column update** (e.g. "IANA is requested to
    update the reference for PMSI Tunnel Type value M to point to this
    document") — gated on the obsoletes decision.

## Decision record (references/decision-record-template.md)

Every run writes one record at the canonical path
`ai-tools/import-ietf-content/decisions/` (not via a `.claude/skills/...` symlink),
named `rfc<N>.md` for an RFC or `<draft-name>.md` (without the `-NN` version
suffix) for a draft — so re-running on a newer draft version updates the same
record. It contains:

- Source document + version (and resolution method for drafts).
- Core-content inventory (core vs non-core classification).
- **Skill recommendation:** import / skip + rationale.
- **User decision:** import / skip.
- **Override rationale:** required only when decision ≠ recommendation.
- Section mapping (when importing) — with a Provenance (source text | derivation
  reason) column, so every mapped edit is accounted for (normative additions cite
  source text; editorial/consequential edits state a derivation reason).
- **Flag list** (human-gated follow-ups):
  - obsoletes / updates decision (pending / decided);
  - IANA registry reference-column update (if obsoleting);
  - note that the planned informational-summary section (`WorkItems.md`:
    "summarize all relevant MVPN features and RFCs") needs updating to reflect
    this incorporation — the skill **flags only; it does not edit that
    section**.

The matching `WorkItems.md` line is updated with a status and a pointer to the
record. This makes both "imported" and "skipped" outcomes reviewable in git by
other contributors.

## Out of scope (YAGNI)

- Editing the informational-summary section (separate work item).
- Running git (branch/commit/PR) — recommended to the human, not executed.
- Deciding obsoletes/updates on the user's behalf.
- Multi-document batch import.
- Auto-allocating IANA code points.

## Open implementation notes

- `scripts/fetch-source.sh` portability: keep dependencies minimal (curl + a
  text/XML reader); the skill must still function if the script is unavailable
  by fetching directly.
- The SKILL.md `description` must trigger reliably on phrasings like "import
  RFC N into 6514bis" / "pull RFC N content in" without over-triggering on
  unrelated editing of the draft.
