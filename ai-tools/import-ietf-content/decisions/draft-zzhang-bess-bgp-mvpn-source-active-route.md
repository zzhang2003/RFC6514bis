# Decision record

---
## Import decision: draft-zzhang-bess-bgp-mvpn-source-active-route

- **Source document:** draft-zzhang-bess-bgp-mvpn-source-active-route
- **Version:** draft rev -00  (resolution: datatracker latest revision via fetch-source.sh)
- **Date / author:** 2026-06-05 / Rishabh Parekh (co-author of the source draft)

### Core-content inventory

| Item | Source section | Core? | Notes |
|------|----------------|-------|-------|
| Topology + PE2-failure narrative (a failed C-RP PE tears down a still-live path) | Background | No | Motivation/use-case |
| Quote of RFC 6514's three SA-discovery methods (C-RP / Anycast-RP / MSDP) | Background | No | Restates text already in 6514bis "Discovering Active Multicast Sources" |
| Any PE that discovers a (C-S,C-G) flow on a PE-CE interface MUST originate an SA route; MUST withdraw when the flow is no longer active | Specification | Yes | New normative behavior — generalizes SA origination beyond the C-RP/MSDP PE |
| A PE MAY use its (C-S,C-G) state when the RPF interface is a PE-CE interface (state triggered by traffic or by a received C-multicast route); MAY originate the SA route immediately on state creation | Specification | Yes | New normative behavior (genuinely optional discovery method) |
| Withdraw when no traffic for > PIM Keepalive_Period, or when the (C-S,C-G) state is deleted | Specification | Yes | Depends on the Keepalive_Period value (RFC 7761) |
| Note: the Keepalive_Period value is used but not the RFC 7761 Keepalive Timer mechanism | Specification | Yes (clarifying) | Bounds the RFC 7761 dependency to a value |
| IANA code points | — | None | Pure procedure; reuses the existing Source Active A-D route encoding |

### Assessment

- **Skill recommendation:** import — small, well-bounded normative augmentation of an
  existing 6514bis procedure (the delta-import pattern); no new encodings, no IANA,
  a single new normative block; only dependency drag is RFC 7761 (cite, not import).
  Matches WorkItems line 19.
- **User decision:** import
- **Override rationale:** n/a

### "Optional" framing discussion (P4)

The source draft labels the change an "optional enhancement" in both its Abstract
("an optional enhancement to the advertisement of SA routes is desired") and its
Specification intro ("This section specifies an optional enhancement to the
origination of SA routes in the SPT-only mode"). This conflicts with the draft's
own ¶1, which states the PE **MUST** originate / **MUST** withdraw. The user
(co-author) noted the draft identifies a real RFC 6514 defect (a non-forwarding
C-RP PE failure can cause traffic loss), so a blanket "optional" framing is
misleading.

Resolution adopted: do **not** put "Optional" in the heading. Use an opt-in lead
sentence — an implementation MAY support the enhancement, and a PE that supports it
MUST originate/withdraw (conformance binds once opted in). Within the enhancement,
only the (C-S,C-G)-state discovery method and immediate-origination remain MAY,
matching the source's actual normative keywords. Heading:
`##Source Active Route Origination by Any PE`.

### Reference handling

- RFC 6514 self-reference ("section 14 of [RFC6514]") rewritten as an in-document
  cross-reference to `{{discovering-active-sources}}`; no external citation kept.
- RFC 7761 added as `{{!RFC7761}}` (normative) — used **only** with the imported
  Keepalive_Period text, per user instruction. Existing `{{!RFC4601}}` PIM citations
  in the bis draft were left untouched; the user will hold a separate discussion
  with the authors about migrating all RFC 4601 citations to RFC 7761.
- Source-draft citation error flagged (not imported): the Background cites
  `[RFC7611]` ("BGP ACCEPT_OWN Community Attribute") for "PIM ... Join Messages";
  the correct reference is RFC 7761 (PIM-SM). This is in non-core text, so it was
  not carried in; recommend fixing it in the source draft.

### Section mapping (import only)

| Imported item | Target in rfc6514bis.md (heading/anchor) | Extend / New |
|---------------|------------------------------------------|--------------|
| Anchor added for cross-reference | `##Discovering Active Multicast Sources {#discovering-active-sources}` | Extend (anchor only) |
| All three core normative pieces + clarifying note | new `##Source Active Route Origination by Any PE {#sa-origination-any-pe}`, under `#Supporting PIM-SM without Inter-Site Shared C-Trees`, inserted before `##Receiver(s) within a Site` | New |

### Human-gated follow-ups

- [ ] **obsoletes / updates:** pending — the source draft `updates: 6514`; folding it
      into the bis (which itself will update/obsolete 6514) may make a separate
      `updates`/`obsoletes` entry for this draft unnecessary. Working-group editorial call.
- [ ] **IANA registry reference update:** n/a — no code points imported.
- [ ] **RFC 4601 → RFC 7761 citation migration:** user to discuss with authors
      (out of scope for this import; only the new text uses RFC 7761).
- [ ] **Informational-summary section:** needs updating to reflect this
      incorporation (flag only — this skill does not edit that section).
---
