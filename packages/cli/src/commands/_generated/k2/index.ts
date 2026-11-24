import $streams from "./streams/index.js";
/**
 * k2 command
 * @generated from apis/overlays/k2.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "k2",
	describe:
		"Durable, ordered event streams that you produce records to and consume from with subscriptions",

	routes: {
		streams: $streams,
	},
});

export default command;
