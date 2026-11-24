import $list from "./list.js";
/**
 * protocols command group
 * @generated from apis/overlays/spectrum.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "protocols",
	describe: "Operations for protocols",

	routes: {
		list: $list,
	},
});

export default command;
