import $get from "./get.js";
import $list from "./list.js";
/**
 * asset-schemas command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "asset-schemas",
	describe: "Operations for casb.asset-schemas",

	routes: {
		get: $get,
		list: $list,
	},
});

export default command;
