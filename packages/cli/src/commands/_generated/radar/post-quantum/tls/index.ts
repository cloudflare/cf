import $support from "./support.js";
/**
 * tls command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "tls",
	describe: "Operations for post-quantum.tls",

	routes: {
		support: $support,
	},
});

export default command;
