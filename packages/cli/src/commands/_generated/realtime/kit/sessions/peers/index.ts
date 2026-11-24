import $get from "./get.js";
/**
 * peers command group
 * @generated from apis/overlays/realtime.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "peers",
	describe: "Peer details from historical RealtimeKit sessions",

	routes: {
		get: $get,
	},
});

export default command;
