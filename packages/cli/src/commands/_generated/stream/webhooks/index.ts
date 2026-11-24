import $delete from "./delete.js";
import $get from "./get.js";
import $update from "./update.js";
/**
 * webhooks command group
 * @generated from apis/overlays/stream.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "webhooks",
	describe:
		"Webhook notifications for video lifecycle events (ready, error, etc.)",

	routes: {
		delete: $delete,
		get: $get,
		update: $update,
	},
});

export default command;
