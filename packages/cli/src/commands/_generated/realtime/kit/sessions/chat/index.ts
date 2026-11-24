import $export from "./export.js";
/**
 * chat command group
 * @generated from apis/overlays/realtime.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "chat",
	describe: "Chat messages from historical RealtimeKit sessions",

	routes: {
		export: $export,
	},
});

export default command;
