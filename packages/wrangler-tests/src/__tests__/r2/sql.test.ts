import { describe, it } from "vitest";

// `r2 sql query` is wrangler-only. The R2 SQL feature targets a
// separate API host (`api.sql.cloudflarestorage.com`) and is not
// surfaced by forge — cf has no `r2 sql ...` command tree. The
// closest cf equivalent (`cf r2-data-catalog ...`) covers catalog
// management (enable/disable, namespaces, tables, credentials,
// maintenance configs) but not the SQL query endpoint itself.
//
// The whole suite is skipped here rather than ported. If forge
// ever exposes the R2 SQL query endpoint, restore these as real
// tests that route through `runWrangler("r2 sql ...")` against
// the generated cf command.
describe("r2 sql", () => {
	describe("help", () => {
		it.skip("should show help when no subcommand is passed");
		it.skip("should show help for query command");
	});

	describe("query", () => {
		it.skip("should require warehouse and query arguments");
		it.skip("should require WRANGLER_R2_SQL_AUTH_TOKEN environment variable");
		it.skip("should validate warehouse name format");
		it.skip("should execute a successful query and display results");
		it.skip("should handle queries with no results");
		it.skip("should handle query failures");
		it.skip("should handle API connection errors");
		it.skip("should handle invalid JSON responses");
		it.skip(
			"should handle nested objects (as JSON with null converted to '') in query results"
		);
		it.skip("should handle null values in query results");
	});
});
