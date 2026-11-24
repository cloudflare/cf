import $list from "./list.js";
/**
 * rate-plans command group
 * @generated from apis/overlays/zones.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "rate-plans",
	describe: "Operations for rate-plans",

	routes: {
		list: $list,
	},
});

export default command;
