import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $insights from "./insights/index.js";
import $list from "./list.js";
import $query from "./query.js";
import $raw from "./raw.js";
import $timetravel from "./time-travel/index.js";
import $undelete from "./undelete.js";
import $migrations from "#commands/d1/migrations/index.js";
/**
 * d1 command
 * @generated from apis/overlays/d1.ts
 */
import { apiGroup } from "#lib/api-command.js";
import { withHandWrittenDryRun } from "#lib/hand-written-dry-run.js";

const command = apiGroup({
	command: "d1",
	describe:
		"D1 is Cloudflare's managed, serverless database with SQLite's SQL semantics, built-in disaster recovery, and Worker and HTTP API access.",

	routes: {
		create: $create,
		delete: $delete,
		edit: $edit,
		get: $get,
		list: $list,
		query: $query,
		raw: $raw,
		undelete: $undelete,
		insights: $insights,
		migrations: withHandWrittenDryRun($migrations, "preview"),
		"time-travel": $timetravel,
	},
});

export default command;
