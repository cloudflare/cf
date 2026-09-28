---
slug: email-routing-disable-no-force
title: `email-routing disable` lacked `--force` and confirmation
status: Fixed
fix-location: forge-only
last-verified: 2026-09-16
---

# `email-routing disable` lacked `--force` and confirmation

## Historical symptom

Disabling Email Routing is destructive because it removes the zone's Email Routing configuration and associated MX records, but the endpoint uses POST. The generic DELETE rule therefore did not add a confirmation prompt or `--force/-f`, and `--force` was rejected as unknown.

## Current status

Fixed by the Email Routing forge overlay. The operation carries `x-forge-require-confirmation` with the message:

> This operation turns off email routing for a zone.

The current generated `email-routing/disable.ts` exposes `--force` with `-f`, calls `confirmDelete({ force, message })`, exits without a request when the user declines, and uses destructive progress/result labels. The prompt helper appends ` Continue?` to the overlay message.

The active tests in `packages/wrangler-tests/src/__tests__/email-routing.test.ts` cover all three behaviors:

- confirmation accepted and the disable request sent;
- `--force` bypassing the prompt; and
- confirmation declined with no request sent.

Latest fetched Wrangler `origin/main` retains equivalent disable/force coverage. The previous document's old multi-argument `confirmDelete` signature, generated line numbers, and installed `node_modules` overlay path no longer describe this tree.

## Fix location

Forge-only. The generic cf generator already treats either an HTTP DELETE or an explicit `x-forge-require-confirmation` annotation as destructive. The product overlay is the correct place to declare that this non-DELETE operation needs the same UX.
