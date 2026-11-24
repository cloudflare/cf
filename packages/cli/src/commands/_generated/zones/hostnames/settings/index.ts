import $tlssingle from "./tls-single/index.js";
import $tls from "./tls/index.js";
/**
 * settings command group
 * @generated from apis/overlays/zones.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "settings",
	describe: "Operations for hostnames.settings",

	routes: {
		tls: $tls,
		"tls-single": $tlssingle,
	},
});

export default command;
