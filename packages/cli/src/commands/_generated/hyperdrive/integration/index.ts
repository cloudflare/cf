import $planetscale from "./planetscale/index.js";
/**
 * integration command group
 * @generated from apis/overlays/hyperdrive.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "integration",
	describe: "Operations for integration",

	routes: {
		planetscale: $planetscale,
	},
});

export default command;
