# Import IETF Content Skill — Implementation Plan

> **Execution method (chosen):** Run this plan via the deterministic **`Workflow` JS harness** — script at `ai-tools/docs/construct-import-ietf-skill.workflow.js`. It builds the bundle task-by-task with an implementer agent plus an adversarial reviewer agent per task (independent reference files fan out in parallel). Execute it in a **separate executor session** by invoking the `Workflow` tool with that `scriptPath`; do not run it inline. The script reads THIS plan as its single source of truth.
>
> **No commits:** this plan performs no git operations (all commit steps were intentionally removed). Each task ends at its final verification step; the repo owner handles git separately.
>
> Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a platform-agnostic, Agent-Skills-standard `SKILL.md` bundle under `ai-tools/import-ietf-content/` that imports the core content of one IETF RFC/draft into `rfc6514bis.md`.

**Architecture:** A single standard `SKILL.md` (portable frontmatter only) carries a lean 6-phase workflow spine and defers detail to `references/*.md` (progressive disclosure). An optional `scripts/fetch-source.sh` helper does XML-first fetching. Per-run output is a decision record under `decisions/`. A local, git-ignored symlink exposes the skill to Claude Code without committing anything Claude-specific.

**Tech Stack:** Markdown (Agent Skills standard), Bash + curl. No build system; verification is structural lint plus one live script execution.

**Source spec:** `ai-tools/docs/2026-06-05-import-ietf-content-skill-design.md`

---

## Conventions for this plan

- **TDD substitution:** these are prose/script artifacts. Each task's "test" is a concrete verification command with expected output. The fetch script is the one artifact with a real execution test (needs network at execution time).
- **No commits:** this plan performs no git operations. The repo owner handles all staging, branching, and committing separately. Do not run `git add` / `git commit` during execution; each task ends at its final verification step. (Read-only git checks like `git check-ignore` are allowed where noted.)
- **Lint helpers** (used throughout):
  - No trailing whitespace: `! grep -nE ' +$' <file>` → prints nothing, exit 0.
  - Final newline present: `[ -n "$(tail -c1 <file>)" ] && echo "MISSING NEWLINE" || echo OK` → `OK`.

---

## Task 1: Scaffold the skill directory

**Files:**
- Create: `ai-tools/import-ietf-content/decisions/.gitkeep`

- [ ] **Step 1: Verify the target does not yet exist**

Run: `test -e ai-tools/import-ietf-content && echo EXISTS || echo ABSENT`
Expected: `ABSENT`

- [ ] **Step 2: Create the directory tree**

```bash
mkdir -p ai-tools/import-ietf-content/references
mkdir -p ai-tools/import-ietf-content/scripts
mkdir -p ai-tools/import-ietf-content/decisions
touch ai-tools/import-ietf-content/decisions/.gitkeep
```

- [ ] **Step 3: Verify the tree**

Run: `find ai-tools/import-ietf-content -type d | sort`
Expected (4 lines):
```
ai-tools/import-ietf-content
ai-tools/import-ietf-content/decisions
ai-tools/import-ietf-content/references
ai-tools/import-ietf-content/scripts
```

---

## Task 2: fetch-source.sh (XML-first fetch helper)

**Files:**
- Create: `ai-tools/import-ietf-content/scripts/fetch-source.sh`

- [ ] **Step 1: Verify the script is absent (failing pre-check)**

Run: `test -x ai-tools/import-ietf-content/scripts/fetch-source.sh && echo OK || echo MISSING`
Expected: `MISSING`

- [ ] **Step 2: Write the script**

Create `ai-tools/import-ietf-content/scripts/fetch-source.sh`:

```bash
#!/usr/bin/env bash
# Fetch an IETF document source, XML-first with HTML/TXT fallback.
# Usage: fetch-source.sh <RFC-number | draft-name>   (exactly one document)
# Prints the document body to stdout; non-zero exit on failure.
set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "usage: $0 <RFC-number | draft-name>  (exactly one document)" >&2
  exit 2
fi

arg="$1"
urls=()

if printf '%s' "$arg" | grep -qiE '^(rfc[[:space:]]*)?[0-9]+$'; then
  # RFC: "RFC6625", "rfc 6625", or bare "6625"
  num="$(printf '%s' "$arg" | grep -oE '[0-9]+')"
  base="https://www.rfc-editor.org/rfc/rfc${num}"
  urls=("${base}.xml" "${base}.html" "${base}.txt")
else
  # Internet-Draft: resolve latest revision via datatracker, fetch from archive.
  name="${arg%.txt}"; name="${name%.xml}"
  rev="$(curl -fsSL "https://datatracker.ietf.org/api/v1/doc/document/${name}/?format=json" \
        | grep -oE '"rev"[[:space:]]*:[[:space:]]*"[0-9]+"' | head -1 | grep -oE '[0-9]+' || true)"
  if [ -z "${rev}" ]; then
    echo "could not resolve latest revision for draft '${name}' via datatracker" >&2
    exit 3
  fi
  base="https://www.ietf.org/archive/id/${name}-${rev}"
  urls=("${base}.xml" "${base}.html" "${base}.txt")
fi

for u in "${urls[@]}"; do
  if curl -fsSL "$u"; then
    exit 0
  fi
done

echo "failed to fetch any source format for '${arg}'" >&2
exit 1
```

- [ ] **Step 3: Make it executable**

Run: `chmod +x ai-tools/import-ietf-content/scripts/fetch-source.sh`

- [ ] **Step 4: Verify argument guard (no network needed)**

Run: `ai-tools/import-ietf-content/scripts/fetch-source.sh a b; echo "exit=$?"`
Expected: usage message on stderr and `exit=2`.

- [ ] **Step 5: Verify live RFC fetch returns XML (needs network)**

Run: `ai-tools/import-ietf-content/scripts/fetch-source.sh RFC6625 | head -c 60`
Expected: output begins with an XML declaration, e.g. `<?xml version="1.0"`.

- [ ] **Step 6: Lint**

Run: `! grep -nE ' +$' ai-tools/import-ietf-content/scripts/fetch-source.sh && echo CLEAN`
Expected: `CLEAN`

---

## Task 3: references/core-taxonomy.md

**Files:**
- Create: `ai-tools/import-ietf-content/references/core-taxonomy.md`

- [ ] **Step 1: Write the file**

Create `ai-tools/import-ietf-content/references/core-taxonomy.md`:

```markdown
# Core-content taxonomy

These are **default, overridable** heuristics. They make the import/skip
judgment consistent across contributors and tools. You and the user may
override any of them per document — record the override and its rationale in
the decision record.

## Core — import

- Wire encodings: MCAST-VPN NLRI route types, BGP path attributes, extended
  communities, and their flags/fields.
- Normative procedures: origination, reception, and processing rules (the
  MUST/SHOULD behavior).
- IANA code points the procedures depend on.
- Interaction rules with existing RFC 6514 procedures.

## Non-core — leave behind (cite the source RFC instead)

- Motivation and use-case narrative.
- Requirements / background.
- Examples and illustrative walk-throughs.
- Deployment / operational discussion.
- History, and restatements of text already in rfc6514bis.md.

## "Too-much to import" signals → recommend SKIP

- The document is really a separate feature/architecture, not an augmentation
  of RFC 6514's base machinery.
- The normative core alone would bloat rfc6514bis.md disproportionately.
- Heavy dependency chains on yet other specs.

Canonical counter-example (from WorkItems.md): RFC 9573 carries a lot of
use-case/motivation text but a small core procedure — pull only the procedure.

## Scope-trim within core

"Core" is intersected with this document's scope (RFC 6514 — MVPN over
MPLS/BGP IP VPNs). When the source spec also covers an adjacent technology
(e.g. EVPN), import only the in-scope slice and cite the remainder.

## Dependency drag

Imported core may depend on a substrate RFC not yet incorporated here (e.g.
the RFC 7902 PMSI Tunnel Attribute "Extension" bit underlying a new flag).
For each such dependency, decide cite-vs-import, prefer citing to keep scope
bounded, and record it as a decision-record flag.

## Delta imports (core that extends existing 6514bis text)

When the core enhancement modifies an existing 6514bis procedure, the imported
material is often a delta: mostly a restatement of text already in 6514bis plus
a small piece of new normative behavior. Inventory only the NEW normative
behavior as core; treat the surrounding restatement as non-core (leave the
existing 6514bis text in place and extend it).

## Output: core-content inventory

Produce a table classifying each item:

| Item (procedure / encoding / IANA point) | Source section | Core? | Notes |
|-------------------------------------------|----------------|-------|-------|
```

- [ ] **Step 2: Lint — trailing whitespace and final newline**

Run:
```bash
f=ai-tools/import-ietf-content/references/core-taxonomy.md
! grep -nE ' +$' "$f" && [ -z "$(tail -c1 "$f")" ] && echo OK
```
Expected: `OK`

---

## Task 4: references/kramdown-editing.md

**Files:**
- Create: `ai-tools/import-ietf-content/references/kramdown-editing.md`

- [ ] **Step 1: Write the file**

Create `ai-tools/import-ietf-content/references/kramdown-editing.md`:

```markdown
# kramdown editing & correctness rules

Apply these when editing rfc6514bis.md in P5.

## References (mechanical, automatic)

Rewrite every citation in the imported text to inline kramdown:
- Normative: `{{!RFCxxxx}}`
- Informative: `{{?RFCxxxx}}`
- Drafts: `{{!I-D.draft-name}}` / `{{?I-D.draft-name}}`

Do not build a separate reference list; rfc6514bis.md uses inline references.

A reference is normative (`{{!...}}`) if a MUST/SHOULD in the imported text
depends on a value or definition it supplies, even when the reference's full
mechanism is not adopted (e.g. reusing a timer's value but not its timer).

If the source cites the base RFC being revised (e.g. "[RFC6514]"), that citation
becomes a self-reference once imported: rewrite it as in-document prose or a
cross-reference ("the methods described above", "{{anchor}}") — do not keep the
external citation.

## IANA code points — cite, never re-allocate

Imported encodings often carry IANA-assigned code points (e.g. RFC 7441 PMSI
Tunnel Type value; RFC 8534 Leaf-Information-Required flag bits; RFC 6625
wildcard encodings). The value is ALREADY allocated to the source RFC.

- WRONG (requests a duplicate allocation):
  "This document defines codepoint N in the PMSI Tunnel Type registry."
- RIGHT (cites the existing allocation):
  "The PMSI Tunnel Type value N {{!RFC7441}} is used ..."

## kramdown conventions (match the existing draft)

- Headings use the `#`-style with no space after `#` (e.g. `##S-PMSI A-D Route`).
- Artwork/packet diagrams: indent at least 4 spaces, or fence with a line of
  `~~~~~~~~~~~`. Use spaces, never tabs. Match the column style of existing
  bit-field diagrams.
- Cross-references: anchor a heading with `{#anchor}`, reference with
  `{{anchor}}`. The existing draft headings often have neither an `{#anchor}`
  nor a literal number — cite a target by heading text and line range, and if
  new text needs to be cross-referenced, flag whether to add an `{#anchor}`.
  Numbered cross-references in prose (e.g. "Section 14") are auto-numbered at
  render and can desync after edits; there is no local build, so verify them
  with the IETF author-tools render rather than by counting headings.
- No trailing whitespace; the file must end in a single newline.
- Preserve the surrounding prose indentation/wrapping; do not reflow paragraphs
  you are not editing.

## IETF prose & normative style

- Write imported text in the measured RFC register; above all, MATCH THE
  SURROUNDING SECTION of rfc6514bis.md — its voice, sentence rhythm, and prose
  indentation.
- Reuse the document's already-defined terms (PE, P-tunnel, C-multicast,
  x-PMSI A-D route, etc.); do not introduce synonyms for concepts the draft
  already names.
- Use RFC 2119 / RFC 8174 keywords (MUST, SHOULD, MAY, ...) the way the
  surrounding text does.
- Do not rely on the LLM's pretraining to supply RFC style; the kramdown-rfc
  source idioms are not in the published-RFC corpus, and prose-style priors
  vary by vendor. Imitating the adjacent draft text is model-agnostic.

## Human-gated — never auto-apply; log in the decision record

- The `obsoletes` / `updates` YAML frontmatter decision (working-group call).
  The framing differs by input type:
  - **RFC import:** folding an RFC's normative core in may warrant the bis
    *obsoleting* or *updating* that RFC.
  - **Draft import:** "obsoletes" does NOT apply — an Internet-Draft is not a
    published RFC and cannot be obsoleted. Instead note that the draft's own
    `updates`/`obsoletes` of RFC 6514 is subsumed by the bis, and record the
    draft's status (WG-adopted / active vs individual / expired), which bears on
    whether and how its content should be folded in and cited.
  - **Either input type — inherited relationships:** if the source itself
    `updates`/`obsoletes` RFCs *other than* RFC 6514, consider whether the bis
    must carry those `updates`/`obsoletes` entries once it absorbs the content
    (scope-trimmed to what is actually imported). E.g. RFC 9573 also updates
    RFC 7432 (EVPN — likely out of scope) and RFC 7582 (bidir MVPN — in scope).
    Flag each such RFC.
  - **Record, do not resolve.** Obsoletes/updates *chains* across multiple
    imports (one import updates RFC XXX, a later import obsoletes it, or vice
    versa; the bis may itself obsolete XXX) are NOT for the skill to reconcile.
    Record each import's relationships in its decision record; reconciliation is
    a later, document-wide audit of all decision records by the user.
- Any IANA registry reference-column update (e.g. "IANA is requested to update
  the reference for PMSI Tunnel Type value N to point to this document"), which
  is gated on the obsoletes decision.
```

- [ ] **Step 2: Lint — trailing whitespace and final newline**

Run:
```bash
f=ai-tools/import-ietf-content/references/kramdown-editing.md
! grep -nE ' +$' "$f" && [ -z "$(tail -c1 "$f")" ] && echo OK
```
Expected: `OK`

- [ ] **Step 3: Verify it captures the heading convention accurately**

Run: `grep -n '##S-PMSI A-D Route' rfc6514bis.md | head -1`
Expected: a match (confirms the `#`-no-space convention the reference documents is real).

---

## Task 5: references/decision-record-template.md

**Files:**
- Create: `ai-tools/import-ietf-content/references/decision-record-template.md`

- [ ] **Step 1: Write the file**

Create `ai-tools/import-ietf-content/references/decision-record-template.md`:

```markdown
# Decision record template

Write one record per processed document at
`ai-tools/import-ietf-content/decisions/<doc-id>.md` — the canonical repo path;
write here, not via a `.claude/skills/...` symlink — named `rfc<N>.md` for an
RFC or `<draft-name>.md` (without the `-NN` version suffix) for a draft.
Re-running on a newer draft revision updates the same record.
Copy the block below and fill every field.

---
## Import decision: <RFCxxxx | draft-name>

- **Source document:** <RFCxxxx | draft-name>
- **Version:** <RFC (stable) | draft rev -NN>  (resolution: <how latest was found>)
- **Date / author:** <YYYY-MM-DD> / <name>

### Core-content inventory

| Item | Source section | Core? | Notes |
|------|----------------|-------|-------|
|      |                |       |       |

### Assessment

- **Skill recommendation:** <import | skip> — <rationale>
- **User decision:** <import | skip>
- **Override rationale:** <required only when decision != recommendation; else "n/a">

### Section mapping (import only)

| Provenance (source text \| derivation reason) | Imported item / edit | Target in rfc6514bis.md (heading + line range) | Extend / New |
|------------------------------------------------|----------------------|------------------------------------------------|--------------|
|                                                |                      |                                                |              |

### Human-gated follow-ups

- [ ] **obsoletes / updates:** <RFC import: bis obsoletes/updates RFC N? (WG
      call) | draft import: n/a — "obsoletes" cannot apply to a draft; note the
      draft's status (WG/active vs individual/expired) and that its update of
      RFC 6514 is subsumed by the bis>
- [ ] **inherited updates/obsoletes:** <RFCs other than 6514 that the source
      updates/obsoletes and that the bis may need to carry for the imported
      (scope-trimmed) content: list | n/a>
- [ ] **IANA registry reference update:** <n/a | needed for value ...>
- [ ] **Informational-summary section:** needs updating to reflect this
      incorporation (flag only — this skill does not edit that section).
---
```

- [ ] **Step 2: Lint — trailing whitespace and final newline**

Run:
```bash
f=ai-tools/import-ietf-content/references/decision-record-template.md
! grep -nE ' +$' "$f" && [ -z "$(tail -c1 "$f")" ] && echo OK
```
Expected: `OK`

---

## Task 6: SKILL.md (the workflow spine)

**Files:**
- Create: `ai-tools/import-ietf-content/SKILL.md`

- [ ] **Step 1: Write the file**

Create `ai-tools/import-ietf-content/SKILL.md`:

````markdown
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
````

- [ ] **Step 2: Verify frontmatter carries ONLY portable keys**

Run:
```bash
sed -n '2,/^---$/p' ai-tools/import-ietf-content/SKILL.md | grep -E '^[A-Za-z_-]+:' \
  | grep -vE '^(name|description):' && echo "NON-PORTABLE KEY FOUND" || echo OK
```
Expected: `OK` (no `allowed-tools`, `model`, `license`, etc.).

- [ ] **Step 3: Verify every referenced bundle file exists**

Run:
```bash
cd ai-tools/import-ietf-content
for f in references/core-taxonomy.md references/kramdown-editing.md \
         references/decision-record-template.md scripts/fetch-source.sh; do
  test -e "$f" && echo "OK $f" || echo "MISSING $f"
done; cd - >/dev/null
```
Expected: four `OK` lines, no `MISSING`.

- [ ] **Step 4: Lint — trailing whitespace and final newline**

Run:
```bash
f=ai-tools/import-ietf-content/SKILL.md
! grep -nE ' +$' "$f" && [ -z "$(tail -c1 "$f")" ] && echo OK
```
Expected: `OK`

---

## Task 7: Local git-ignored Claude Code symlink

**Files:**
- Create: `.claude/skills/import-ietf-content` (symlink, git-ignored)
- Modify/Create: `.gitignore`

- [ ] **Step 1: Ensure `.gitignore` ignores the symlink**

Run:
```bash
grep -qxF '.claude/skills/' .gitignore 2>/dev/null || printf '%s\n' '.claude/skills/' >> .gitignore
```

- [ ] **Step 2: Create the relative symlink**

```bash
mkdir -p .claude/skills
ln -sfn ../../ai-tools/import-ietf-content .claude/skills/import-ietf-content
```

- [ ] **Step 3: Verify the symlink resolves to the skill dir**

Run: `test -f .claude/skills/import-ietf-content/SKILL.md && echo OK || echo BROKEN`
Expected: `OK`

- [ ] **Step 4: Verify the symlink is git-ignored (read-only git check)**

Run: `git check-ignore .claude/skills/import-ietf-content && echo IGNORED`
Expected: `IGNORED`

---

## Task 8: End-to-end dry validation (no draft edits)

This task confirms the assembled skill is internally consistent. It does NOT
import anything into rfc6514bis.md.

- [ ] **Step 1: Confirm full bundle layout**

Run: `find ai-tools/import-ietf-content -type f | LC_ALL=C sort`
Expected (6 files, `LC_ALL=C` order):
```
ai-tools/import-ietf-content/decisions/.gitkeep
ai-tools/import-ietf-content/references/core-taxonomy.md
ai-tools/import-ietf-content/references/decision-record-template.md
ai-tools/import-ietf-content/references/kramdown-editing.md
ai-tools/import-ietf-content/scripts/fetch-source.sh
ai-tools/import-ietf-content/SKILL.md
```

- [ ] **Step 2: Repo-wide lint of the bundle**

Run:
```bash
fail=0
while IFS= read -r f; do
  grep -nE ' +$' "$f" && { echo "TRAILING WS: $f"; fail=1; }
  [ -s "$f" ] || continue   # empty placeholders (e.g. .gitkeep) need no final newline
  [ "$(tail -c1 "$f" | wc -l)" -eq 1 ] || { echo "NO FINAL NEWLINE: $f"; fail=1; }
done < <(find ai-tools/import-ietf-content -type f)
[ "$fail" -eq 0 ] && echo "LINT CLEAN"
```
Expected: `LINT CLEAN`

- [ ] **Step 3: Confirm the skill triggers in Claude Code (manual)**

In a fresh Claude Code session in this repo, confirm `import-ietf-content`
appears in the available skills list (via the git-ignored symlink). Note: other
tools consume `ai-tools/import-ietf-content/SKILL.md` directly.
