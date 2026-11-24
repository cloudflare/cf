import $custom from "./custom/index.js";
import $managed from "./managed/index.js";
/**
 * domains command group
 * @generated from apis/overlays/r2.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "domains",
	describe: "Operations for buckets.domains",

	routes: {
		custom: $custom,
		managed: $managed,
	},
});

export default command;
