import $update from "./update.js";
/**
 * prioritize command group
 * @generated from apis/overlays/ssl.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "prioritize",
	describe: "Operations for custom-certificates.prioritize",

	routes: {
		update: $update,
	},
});

export default command;
