import $start from "./start.js";
import $status from "./status.js";
/**
 * purge command group
 * @generated from apis/overlays/queues.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "purge",
	describe: "Remove all pending messages from a queue",

	routes: {
		start: $start,
		status: $status,
	},
});

export default command;
