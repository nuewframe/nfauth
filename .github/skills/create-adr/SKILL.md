---
name: create-adr
description: >
  Create an Architecture Decision Record for a durable technical or product
  architecture decision using the project's canonical ADR location.
user-invocable: true
disable-model-invocation: false
---

# Skill: Create ADR

Use this skill to create a new Architecture Decision Record (ADR) that is
easy to review, easy to find, and durable over time.

## Use When

Trigger phrases:

- "architecture decision"
- "should we"
- "why did we choose"
- "write an ADR"
- "create a decision record"
- "document architecture"

Use for significant, long-lived decisions (architecture, security boundaries,
platform/runtime choices, testing strategy, data and operational constraints).

## Do Not Use When

- The request is implementation-only with no durable decision.
- The decision is temporary and does not need historical traceability.

## Required Inputs

Before writing, gather:

1. Decision scope and constraints from project context.
2. Existing ADR directory and naming pattern.
3. Next sequential ADR number.

If any required input is missing, stop and ask for only the missing input.

## Output Contract

Generate exactly one new ADR file with:

- Directory: `docs/adr/` (fallback `doc/adr/` only if repo uses it)
- Filename: `NNNN-short-noun-phrase.md`
- Numbering: monotonic sequence (4 digits)
- Status value: one of `Proposed`, `Accepted`, `Rejected`,
  `Superseded by ADR-NNNN`

The ADR must include all headings below, in this order:

1. `# [NNNN] - [Short Noun Phrase Title]`
2. `**Date:** [YYYY-MM-DD]`
3. `**Status:** [Proposed | Accepted | Rejected | Superseded by ADR-NNNN]`
4. `## Context and Problem Statement`
5. `## Considered Alternatives`
6. `## Decision Outcome`
7. `### Pros and Cons of the Alternatives`
8. `## Consequences`

Any empty section must explicitly say `N/A` or `None identified`.

## Procedure

1. Read project context and identify the architectural problem.
2. Locate ADR folder and determine next `NNNN`.
3. Define a short noun-phrase slug and title.
4. List 2-5 realistic alternatives including status quo when applicable.
5. Select one chosen alternative and justify why it wins key tradeoffs.
6. Add at least one `+` and one `-` for each listed alternative.
7. Write consequences including follow-up tasks, migrations, or deprecations.
8. Ensure status semantics are correct:
   - Accepted ADRs are immutable.
   - Changed direction requires a new ADR and supersedence linkage.

## Validation Checklist

- Filename matches `^\d{4}-[a-z0-9]+(-[a-z0-9]+)*\.md$`
- ADR number is next in sequence.
- Status is in allowed enum.
- Context is value-neutral, specific, and concise.
- Alternatives count is at least 2.
- Every alternative has at least one pro and one con.
- Decision section explains why, not just what.
- Consequences include concrete follow-up impact.

## ADR Template

```markdown
# [NNNN] - [Short Noun Phrase Title]

**Date:** [YYYY-MM-DD]
**Status:** [Proposed | Accepted | Rejected | Superseded by ADR-NNNN]

## Context and Problem Statement

[2-4 value-neutral sentences describing requirements and forces.]

## Considered Alternatives

- [Alternative 1]
- [Alternative 2]
- [Alternative 3]

## Decision Outcome

**Chosen Alternative:** [Alternative 1]

[Why this option was selected, including key tradeoffs.]

### Pros and Cons of the Alternatives

#### [Alternative 1]

- `+` [Good, because...]
- `-` [Bad, because...]

#### [Alternative 2]

- `+` [Good, because...]
- `-` [Bad, because...]

## Consequences

[Positive, negative, and follow-up impacts.]
```

## Minimal Example

```markdown
# 0002 - Use Hierarchical Config for Profile Selection

**Date:** 2026-04-09
**Status:** Accepted

## Context and Problem Statement

The CLI currently stores profile selection in a flat key that diverges from
the Java security schema. This blocks future multi-profile support and
increases translation bugs. A shared hierarchical model is needed.

## Considered Alternatives

- Keep flat key and translate on read
- Adopt hierarchical schema
- Use environment variables only

## Decision Outcome

**Chosen Alternative:** Adopt hierarchical schema

This aligns CLI and Java behavior, reduces hidden translation coupling, and
supports future multi-profile scenarios with acceptable migration cost.

### Pros and Cons of the Alternatives

#### Keep flat key and translate on read

- `+` Minimal migration effort
- `-` Hidden coupling and future scaling limits

#### Adopt hierarchical schema

- `+` Schema alignment and clearer validation
- `-` Requires migration of existing config

#### Use environment variables only

- `+` No file parsing
- `-` Poor reviewability and weak multi-environment workflows

## Consequences

Config migration is required and docs must be updated. Follow-up tasks: provide
migration script, deprecate legacy flat config, add mixed-format validation.
```

## References

- Nygard ADR Standard: https://adr.github.io/
- MADR: https://adr.github.io/madr/
- Why ADRs Matter for Open Source:
  https://cognitivemedium.com/oss-decision-records
