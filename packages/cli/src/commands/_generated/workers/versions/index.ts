import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $profile from "./profile.js";
import $create from "#commands/workers/versions/create/index.js";
/**
 * versions command group
 * @generated from apis/overlays/workers.ts
 */
import { apiGroup } from "#lib/api-command.js";
import { withHandWrittenDryRun } from "#lib/hand-written-dry-run.js";

const command = apiGroup({
	command: "versions",
	describe: "Create, list, inspect, and manage Worker versions",

	routes: {
		create: withHandWrittenDryRun($create, "native"),
		delete: $delete,
		get: $get,
		list: $list,
		profile: $profile,
	},
});

export default command;
