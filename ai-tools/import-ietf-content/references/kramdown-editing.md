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
