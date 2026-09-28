import { withTelemetry } from "#lib/telemetry/index.js";
/**
 * `cf d1 migrations` — D1 migration file lifecycle.
 *
 * Hand-written rather than generated: applying migrations is a filesystem
 * walk plus N calls to one endpoint, which the generator (one command per
 * operation) cannot express, and the file discovery / ordering / bookkeeping
 * semantics have no representation in OpenAPI. There is no D1 migrations
 * operation in the spec at all, so this is a whole sub-group added to the
 * generated `d1` tree rather than a leaf override — see
 * `HAND_WRITTEN_SUBGROUPS` in `generator/hand-written-overrides.ts`, and
 * `migrations-drift.test.ts` for the guard that keeps this in step.
 *
 * This does name a product — it talks to `client.d1.*` and owns the
 * `d1_migrations` table convention — which is the documented exception to
 * the "no API product names in `src/`" invariant that every entry in that
 * table takes.
 *
 * Local mode uses the same bookkeeping SQL against Miniflare's persisted D1
 * storage, so a project can switch between cf and Wrangler without replaying
 * migrations.
 */
import $apply from "./apply.js";
import $create from "./create.js";
import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "migrations",
	describe: "Create, list, and apply D1 database migrations",

	builder: (yargs) => {
		return yargs
			.command(
				withTelemetry($apply, {
					command: "d1 migrations apply",
					classification: { safeFlags: [] },
				})
			)
			.command(
				withTelemetry($create, {
					command: "d1 migrations create",
					classification: { safeFlags: [] },
				})
			)
			.command(
				withTelemetry($list, {
					command: "d1 migrations list",
					classification: { safeFlags: [] },
				})
			)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
