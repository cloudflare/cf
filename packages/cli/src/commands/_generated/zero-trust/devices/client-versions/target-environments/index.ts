import $list from "./list.js";
/**
 * target-environments command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "target-environments",
	describe: "Operations for devices.client-versions.target-environments",

	routes: {
		list: $list,
	},
});

export default command;
