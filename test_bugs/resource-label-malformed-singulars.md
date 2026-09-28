---
slug: resource-label-malformed-singulars
title: Resource-name singularization produced malformed labels
status: Fixed
fix-location: cf-only
last-verified: 2026-09-16
---

# Resource-name singularization produced malformed labels

## Historical symptom

Progress and success labels once derived a resource noun by trimming a final `s`. This produced strings such as “Deleting addresse” and “Updating statu”. An intermediate fix introduced a singularization helper and irregular-word table.

## Current status

Fixed by a simpler design. `packages/cli/generator/codegen/labels.ts` now generates verb-only labels such as `Creating`, `Updating`, `Deleting`, and `Loading`. It does not derive, pluralize, or singularize API resource names.

The current generated email-routing address delete command, for example, uses `withProgress("Deleting", ...)` and `successLabel: "Deleted"`. The old Workflows status path referenced by this record is no longer evidence for a singularization table because no such table exists.

## Resolution

Removing nouns avoids malformed English and keeps labels stable when Forge group names change. Operation-specific success prose, if ever required, should come from an explicit annotation rather than inferred grammar.
