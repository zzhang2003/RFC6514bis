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
