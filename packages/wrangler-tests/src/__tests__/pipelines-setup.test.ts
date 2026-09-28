// `wrangler pipelines setup` is an interactive multi-step wizard
// that orchestrates stream creation, R2 bucket creation/lookup, R2
// Data Catalog enablement, sink creation, SQL validation, and
// pipeline creation in a single guided flow. cf has the underlying
// CRUD commands (`pipelines create`, `pipelines streams create`,
// `pipelines sinks create`, `pipelines validate-sql`) but no
// `pipelines setup` equivalent. Multi-step interactive orchestration needs a
// bounded hand-written design rather than generic product branching, so every
// test in this file currently exercises behavior that does not exist in cf.
//
// Every test below drives clack prompts (mockPrompt/mockSelect/
// mockConfirm) through the wizard's state machine — there is no
// single CRUD endpoint to retarget at, and there's no `cf pipelines
// setup` to invoke. So every test is `.skip` rather than ported.
import { describe, it } from "vitest";

describe("wrangler pipelines setup", () => {
	describe("pipeline name validation", () => {
		it.skip("validates pipeline name provided via --name flag - rejects hyphens", () => {});
		it.skip("accepts valid pipeline name with underscores and proceeds to stream config", () => {});
		it.skip("falls back to interactive prompt when --name is empty string", () => {});
	});

	describe("interactive validation retry", () => {
		it.skip("shows retry prompt when invalid pipeline name entered interactively", () => {});
		it.skip("allows retry and accepts valid name on second attempt", () => {});
		it.skip("allows multiple retries before succeeding", () => {});
	});

	describe("bucket name validation", () => {
		it.skip("rejects bucket names with underscores", () => {});
		it.skip("rejects bucket names that are too short", () => {});
		it.skip("allows retry with valid bucket name after invalid input", () => {});
	});

	describe("stream configuration", () => {
		it.skip("proceeds through schema selection options with HTTP auth enabled", () => {});
	});

	describe("schema loading from file", () => {
		it.skip("loads schema from JSON file", () => {});
		it.skip("retries when schema file not found", () => {});
	});

	describe("sink creation retry and cleanup", () => {
		it.skip("cleans up stream when user cancels after sink failure", () => {});
	});

	describe("pipeline creation failure", () => {
		it.skip("exits gracefully when user declines retry after pipeline failure", () => {});
	});

	describe("rolling policy validation", () => {
		it.skip("validates file size minimum", () => {});
		it.skip("validates interval minimum", () => {});
	});

	describe("Data Catalog sink configuration", () => {
		it.skip("enables catalog when not already enabled", () => {});
		it.skip("shows already enabled message when catalog is active", () => {});
		it.skip("creates bucket when it does not exist", () => {});
		it.skip("retries when catalog token validation fails", () => {});
	});

	describe("Advanced mode Data Catalog sink", () => {
		it.skip("prompts for namespace and table name", () => {});
	});

	describe("Data Catalog full flow", () => {
		it.skip("completes full setup from bucket to pipeline creation", () => {});
	});

	describe("SQL validation", () => {
		it.skip("shows error and exits when validation fails and user declines retry", () => {});
	});
});
