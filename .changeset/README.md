# Changesets

Every non-trivial change to `cf` — anything that should appear in the
changelog — must be captured in a "changeset".

We use [`changesets`](https://github.com/changesets/changesets/blob/main/README.md)
to create changesets, bump versions, and update the changelog.

## Creating a Changeset

```sh
pnpm changeset
```

1. Select which packages are affected by the change (usually just `cf`).
2. Choose whether the version requires a major, minor, or patch release.
3. Write a description of the change (see format below).
4. Include the generated changeset in your commit:

   ```sh
   git add .changeset/*.md
   ```

## Version Types

- **patch**: Bug fixes and small user-facing improvements. Documentation that accompanies one of those changes belongs in its changeset, but a documentation-only correction does not require a changeset (see below).
- **minor**: New commands, new options, deprecations, and changes to
  experimental / pre-1.0 features (including breaking changes to those
  features). When adding or changing experimental features, call this
  out explicitly in the changeset description.
- **major**: Breaking changes to stable features.

During the 1.0 prereleases, breaking changes go in `minor` bumps and must be called
out explicitly. Major bumps require strong justification.

## Changeset Message Format

```
<TITLE>

<BODY>
```

- **TITLE**: A single sentence with an imperative description.
- **BODY**: One or more paragraphs explaining the reason and anything
  notable about the approach. Aim for more than one sentence but less
  than three paragraphs.

### Good Example

```markdown
---
"cf": minor
---

Add `cf d1 migrations apply`

Apply ordered local migration files to a D1 database identified by ID.
The command records applied migrations in D1 using bookkeeping that is
wire-compatible with Wrangler.
```

## Formatting Rules

- Do not use h1 / h2 / h3 markdown headers in changeset bodies. The
  changelog uses h3 for section headers; any embedded headers must be
  h4 (`####`) or smaller.
- For new features, include a brief usage example when it helps.
- Use code fences for command examples.

## When a Changeset is NOT Required

- Changes that are purely internal refactoring with no user-facing
  impact (e.g. our generator-side dedup work).
- Changes only to devDependencies.
- Documentation-only changes.
- Test-only changes.
- CI / workflow changes.

## Multiple Changesets

If your PR makes multiple distinct user-facing changes, create separate
changesets so each gets its own changelog entry. Don't lump unrelated
changes together.
