import $create from "./create.js";
import $export from "./export.js";
import $list from "./list.js";
/**
 * jobs command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "jobs",
	describe: "Operations for casb.remediations.jobs",

	routes: {
		create: $create,
		export: $export,
		list: $list,
	},
});

export default command;
