import $list from "./list.js";
/**
 * logs command group
 * @generated from apis/overlays/r2.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "logs",
	describe: "Operations for super-slurper.jobs.logs",

	routes: {
		list: $list,
	},
});

export default command;
