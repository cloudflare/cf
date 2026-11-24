import $list from "./list.js";
/**
 * warp-change-events command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "warp-change-events",
	describe: "Operations for dex.warp-change-events",

	routes: {
		list: $list,
	},
});

export default command;
