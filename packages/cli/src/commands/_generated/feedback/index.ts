import $diagnose from "./diagnose.js";
import $send from "./send.js";
/**
 * feedback command
 * @generated from apis/overlays/feedback.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "feedback",
	describe: "feedback",

	routes: {
		diagnose: $diagnose,
		send: $send,
	},
});

export default command;
