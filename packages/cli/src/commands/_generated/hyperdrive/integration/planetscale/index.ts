import $signature from "./signature.js";
/**
 * planetscale command group
 * @generated from apis/overlays/hyperdrive.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "planetscale",
	describe: "Operations for integration.planetscale",

	routes: {
		signature: $signature,
	},
});

export default command;
