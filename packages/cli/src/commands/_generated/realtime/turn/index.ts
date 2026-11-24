import $keys from "./keys/index.js";
/**
 * turn command group
 * @generated from apis/overlays/realtime.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "turn",
	describe: "TURN keys that help clients traverse NATs and firewalls",

	routes: {
		keys: $keys,
	},
});

export default command;
