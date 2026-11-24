import $delete from "./delete.js";
import $replace from "./replace.js";
/**
 * connections command group
 * @generated from apis/overlays/builds.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "connections",
	describe: "Operations for repos.connections",

	routes: {
		delete: $delete,
		replace: $replace,
	},
});

export default command;
