import $enablement from "./enablement/index.js";
/**
 * ohttp-gateway command
 * @generated from apis/overlays/ohttp-gateway.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "ohttp-gateway",
	describe: "ohttp-gateway",

	routes: {
		enablement: $enablement,
	},
});

export default command;
