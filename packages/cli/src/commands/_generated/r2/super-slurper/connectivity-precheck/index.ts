import $source from "./source.js";
import $target from "./target.js";
/**
 * connectivity-precheck command group
 * @generated from apis/overlays/r2.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "connectivity-precheck",
	describe: "Operations for super-slurper.connectivity-precheck",

	routes: {
		source: $source,
		target: $target,
	},
});

export default command;
