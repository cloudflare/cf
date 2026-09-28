import { describe, it } from "vitest";

// Skipped: every test in this file exercises wrangler's
// `r2 object {put,get}` commands (specifically the `--pipe` flag that
// streams an upload body from stdin). cf can write downloaded bytes to stdout
// through `r2 objects get`, but it has no equivalent upload `--pipe`
// flag or Wrangler banner-suppression contract.
// See `test_bugs/r2-object-not-generated.md`.
describe("pipe test", () => {
	it.todo("should display banner");
	it.todo("should not display banner in pipe mode");
});
