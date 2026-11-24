import $create from "./create.js";
import $delete from "./delete.js";
import $list from "./list.js";
/**
 * domains command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "domains",
	describe: "Operations for credential-monitor.domains",

	routes: {
		create: $create,
		delete: $delete,
		list: $list,
	},
});

export default command;
