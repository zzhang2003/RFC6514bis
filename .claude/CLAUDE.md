# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

This is **not software** — it is the source for an IETF Internet-Draft that will become an RFC. The draft is `rfc6514bis.md`, a revision ("-bis") of **RFC 6514 (BGP Encodings and Procedures for Multicast in MPLS/BGP IP VPNs)**. When published it will **update and obsolete RFC 6514**. Target working group: **BESS**; docname: `draft-ietf-bess-rfc6514bis-NN`; category: Standards Track.

The draft is written in **kramdown-rfc markdown** (the `martinthomson/i-d-template` flavor), not plain Markdown. Editing it means knowing kramdown-rfc conventions, not Markdown ones.

## Files

- `rfc6514bis.md` — the entire draft. Single source of truth. ~2600 lines.
- `WorkItems.md` — the roadmap: proposed changes for this revision, with owners and status (`Done` = in repo, `-NN` = published revision). **Read this before making substantive content changes** — it defines what work is in scope. Several items pull content from other RFCs (6515, 6625, 9081, 7441, 8534, 9573) into this single document.
- `skel.md` — kramdown-rfc syntax reference (artwork, tables, lists, definition lists, references, anchors). Open it before editing if unsure how to format something. Also see https://authors.ietf.org/en/drafting-in-markdown.
- `README.md` — links to the work proposal slides and the live rfcdiff against RFC 6514.

## Document structure (rfc6514bis.md)

The YAML frontmatter (between the leading `---` and `--- abstract`) carries metadata: `title`, `docname`, `category`, `wg`, authors, etc. Then `--- abstract`, then `--- middle` (body), and references/back matter.

Body organization (the "big picture" — a reader needs the whole flow):
1. **Encodings** — MCAST-VPN NLRI and its 7 route types (Intra/Inter-AS I-PMSI A-D, S-PMSI A-D, Leaf A-D, Source Active A-D, C-Multicast), then BGP attributes (PMSI Tunnel, PE Distinguisher Labels) and extended communities (Source AS, VRF Route Import).
2. **Procedures** — MVPN auto-discovery/binding (intra- and inter-AS), C-multicast route exchange among PEs, binding C-trees to P-tunnels via S-PMSI, shared→source tree switching, PIM-SM support, carrier's-carrier, scalability/dampening.

Encodings come first and are referenced throughout the procedures; a change to a route-type or attribute encoding usually has procedural consequences later in the document.

## Editing conventions

- **References:** inline. `{{!RFCxxxx}}` = normative, `{{?RFCxxxx}}` = informative. `{{!I-D.draft-name}}` for drafts. Do not maintain a separate normative/informative reference list unless a reference can't be expressed inline (see commented examples in `skel.md`).
- **Cross-references:** anchors via `{#anchor}` on a heading, referenced with `{{anchor}}`.
- **Artwork / packet diagrams:** indent at least 4 spaces, or fence with `~~~~~~~~~~~` to prevent Markdown interpretation. Use spaces, not tabs. Many bit-field diagrams already exist — match their column style.
- **No trailing whitespace; file must end in a newline.** The i-d-template lint enforces this.
- Preserve the existing prose indentation/wrapping style (text is indented to mirror the eventual RFC layout); match surrounding paragraphs rather than reflowing.

## Building / previewing

No local build toolchain is installed in this repo. Render and diff the draft online with the IETF **author-tools** service (links in `README.md`): upload/point it at `rfc6514bis.md` for `.txt`/`.html` output, and use its diff against the published RFC 6514. The source is kramdown-rfc markdown, so any renderer must be kramdown-rfc-aware (e.g. `kramdown-rfc` → `xml2rfc`) — not a plain Markdown renderer.
