import $refresh from "./refresh.js";
import $revoke from "./revoke.js";
/**
 * tokens command group
 * @generated from apis/overlays/realtime.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "tokens",
	describe: "Access tokens for RealtimeKit meeting participants",

	routes: {
		refresh: $refresh,
		revoke: $revoke,
	},
});

export default command;
