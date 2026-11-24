import $custom from "./custom/index.js";
import $get from "./get.js";
import $list from "./list.js";
import $predefined from "./predefined/index.js";
/**
 * profiles command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "profiles",
	describe: "Data Loss Prevention - list and retrieve profiles",

	routes: {
		get: $get,
		list: $list,
		custom: $custom,
		predefined: $predefined,
	},
});

export default command;
