---
name: import-ietf-content
description: Import the core content of a single IETF RFC or Internet-Draft into the RFC 6514bis draft (rfc6514bis.md). Use when asked to "import RFC N", "pull RFC/draft content into 6514bis", or fold an MVPN spec's procedures/encodings into the bis document. Assesses whether the document is appropriate to import, maps content to sections, and edits in kramdown-rfc.
---

# Import IETF Content into RFC 6514bis

Fold the *core* content of one IETF document into `rfc6514bis.md`, consistently
and correctly. This skill is platform-agnostic: follow the steps with any AI
tool.

## Scope

- Input is exactly ONE IETF document: an RFC number (e.g. `RFC6625`) or one
  Internet-Draft name. Refuse more than one.
- You edit `rfc6514bis.md` and write a decision record. You do NOT run git,
  decide `obsoletes`/`updates`, or edit the informational-summary section.

## Workflow

Follow the phases in order. Three phases are HARD GATES (P3, P4, P5): stop and
get the user's decision before continuing.

### P1 — Fetch & parse

Resolve the document and fetch its source, preferring XML. Use
`scripts/fetch-source.sh <doc>` if available (XML-first, HTML/TXT fallback);
otherwise fetch directly from rfc-editor.org (RFCs) or datatracker.org (drafts,
latest revision). Identify sections, references, and any IANA-backed encodings
(there may be none — a pure-procedure document adds no code points). If the
source cites a reference that is wrong or self-inconsistent (e.g. a citation
pointing to an unrelated RFC), flag it for the user rather than propagating it.

(Claude Code only, optional: to keep the main context clean, you MAY run P1+P2
in a sub-agent that returns only the P2 core-content inventory. Never required.)

### P2 — Extract core content

Apply `references/core-taxonomy.md`. Produce a **core-content inventory**:
list every procedure, encoding, and IANA code point, each marked core or
non-core. The taxonomy is a default heuristic — you and the user may override
it per document.

### P3 — Import-or-skip assessment  [GATE 1]

First present a **concise overview** of the source document (2-4 sentences):
what it specifies, what it adds or changes relative to RFC 6514, and its shape
(e.g. mostly motivation vs. procedure). THEN, using the "too-much" signals in
the taxonomy, recommend **import** or **skip** with rationale. Present the
overview before the assessment. THE USER DECIDES.

- The user may override your recommendation. If their decision differs from
  your recommendation, capture the override rationale.
- If the decision is **skip**: write the decision record (recommendation, user
  decision, override rationale if any), update `WorkItems.md`, and STOP.
- If **import**: continue to P4.

(No decision record is written before this gate; on skip it is written here, on
import it is completed in P6.)

### P4 — Section mapping  [GATE 2]

Produce a mapping table. **Every P5 edit must appear as a row** (completeness —
no silent or un-accounted edits). Each row: **provenance -> target in
`rfc6514bis.md` (heading + line range; extend or new) -> the edit**. Provenance
is typed: a **source citation** (section + cited/quoted text) for content taken
from the source, or a **derivation reason** for editorial/consequential edits
(e.g. reference rewrite, `{#anchor}` addition, self-reference collapse,
terminology alignment, removing a redundant restatement). **Normative additions
(new MUST/SHOULD, wire encodings, IANA changes) MUST cite source text** — never a
bare derivation reason. Significant/structural changes may be a coarse row plus
a short narrative rather than artificially atomized. Cite each target by heading
text and line range (draft headings often lack an `{#anchor}` and a literal
number); if new text will need to be cross-referenced, flag whether to add an
`{#anchor}`. Also ask whether the change warrants bumping the draft revision in
the `docname` frontmatter field (the user decides; do not bump silently).
Present the mapping and get approval before editing.

### P5 — Edit rfc6514bis.md  [GATE 3]

Apply the approved mapping per `references/kramdown-editing.md`:

- rewrite imported references to inline kramdown (`{{!RFCxxxx}}` / `{{?RFCxxxx}}`);
- cite existing IANA code points — never re-request an allocation;
- match the draft's kramdown conventions.

Then show the diff of the ACTUAL edits and STOP for the user to review them. The
applied text can differ from the P4 preview, so approval of the mapping is not
approval of the edit. Get the user's approval before continuing to P6; if they
ask for changes, revise and re-present the diff. Recommend the user create a
branch first; do NOT run git.

### P6 — Finalize

Complete the decision record (at the canonical path
`ai-tools/import-ietf-content/decisions/<doc-id>.md`, not via a `.claude/skills/...`
symlink) from `references/decision-record-template.md`, update the matching
`WorkItems.md` line (status + pointer to the record), and
list the human-gated follow-ups: the `obsoletes`/`updates` decision, any IANA
registry reference-column update, and the note that the informational-summary
section needs updating (flag only — do not edit it).

## Files

- `references/core-taxonomy.md` — what counts as core; "too-much" signals.
- `references/kramdown-editing.md` — reference-rewrite, IANA, kramdown rules.
- `references/decision-record-template.md` — the record format.
- `scripts/fetch-source.sh` — optional XML-first fetch helper.
- `ai-tools/import-ietf-content/decisions/<doc-id>.md` — output record
  (`rfc<N>.md` or `<draft-name>.md`); always write to this canonical repo path,
  not via a `.claude/skills/...` symlink.
