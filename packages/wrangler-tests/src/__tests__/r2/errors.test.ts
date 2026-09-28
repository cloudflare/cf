import { describe, it } from "vitest";

// TODO: re-enable once the underlying bugs are fixed.
//
// The original test exercised wrangler's hand-written pre-upload file-
// existence check for `r2 object put --file <path>`. On cf this is blocked
// by two separate issues:
//
// 1. `test_bugs/r2-object-not-generated.md` — cf's generated upload command
//    does not reproduce Wrangler's `r2 object put --file` contract.
// 2. `test_bugs/vectorize-file-bare-enoent.md` — the same generator
//    `--file` codepath that would serve `r2 object put` leaks a raw Node
//    ENOENT instead of surfacing a user-friendly message. A generic fix
//    there would also cover R2 object uploads.
describe("r2 errors", () => {
	it.todo("should throw a helpful error if attempting to put a missing file");
});
