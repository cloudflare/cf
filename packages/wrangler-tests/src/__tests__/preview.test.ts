// cf now supports Preview deployment through `cf previews deploy`, with focused
// coverage in the CLI package. This Wrangler suite remains unported because its
// configuration behavior does not map directly to cf's Build Output flow.
//
// Original tests covered:
//   - getBranchName helper (Workers CI / GitHub / GitLab env var precedence)
//   - extractConfigBindings helper (preview block → bindings shape)
//   - `wrangler preview` command behaviour (create/update preview, deployments,
//     bindings warnings, --json, redirected configs, observability,
//     tail_consumers, --ignore-defaults, assets, source maps, define,
//     durable_objects, workflows)
//
// The remaining helpers live in `../preview/shared` / `../output` and are not
// present in this repository.

import { describe, test } from "vitest";

describe("wrangler preview (cf uses a separate Build Output flow)", () => {
	test.todo("ported as a no-op skip");
});
