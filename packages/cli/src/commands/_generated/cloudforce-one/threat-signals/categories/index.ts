import $list from "./list.js";
/**
 * categories command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "categories",
	describe: "Operations for threat-signals.categories",

	routes: {
		list: $list,
	},
});

export default command;
