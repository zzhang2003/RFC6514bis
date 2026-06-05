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
