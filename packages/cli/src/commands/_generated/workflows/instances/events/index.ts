import $send from "./send.js";
/**
 * events command group
 * @generated from apis/overlays/workflows.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "events",
	describe: "Operations for instances.events",

	routes: {
		send: $send,
	},
});

export default command;
