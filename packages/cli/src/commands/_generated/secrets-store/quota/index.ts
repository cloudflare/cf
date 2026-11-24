import $get from "./get.js";
/**
 * quota command group
 * @generated from apis/overlays/secrets-store.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "quota",
	describe:
		"Account quota limits for secrets stores, secrets count, and storage capacity",

	routes: {
		get: $get,
	},
});

export default command;
