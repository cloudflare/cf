import { describe, it } from "vite-plus/test";

// `wrangler d1 insights <db>` is a hand-written GraphQL analytics
// command (queries `d1QueriesAdaptiveGroups` against the GraphQL
// gateway and post-processes the rows into avg/total stats). cf's
// generated `d1` surface covers create/delete/edit/export/get/import
// /list/query/raw/time-travel/update — there is no `cf d1 insights`
// and no equivalent generated GraphQL command.
//
// The `getDurationDates()` unit-test cohort below also imports a
// helper (`../../d1/insights`) that lives only in the wrangler
// source tree, not in this repo, so it cannot be ported either.
//
// If/when forge grows a D1 analytics overlay (or cf gains a
// hand-written `d1 insights` shim), this file should be revisited.
describe.skip("getDurationDates()", () => {
	it("should throw an error if duration is greater than 31 days (in days)", () => {});
	it("should throw an error if duration is greater than 31 days (in minutes)", () => {});
	it("should throw an error if duration is greater than 31 days (in hours)", () => {});
	it("should throw an error if duration unit is invalid", () => {});
	it("should return the correct start and end dates", () => {});
});

describe.todo("insights", () => {
	it("should throw if a database name is not provided", () => {});
	it("should throw if database doesn't exist", () => {});
	it("should display valid json output", () => {});
});
