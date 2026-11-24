import $config from "./config/index.js";
import $results from "./results/index.js";
/**
 * scans command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "scans",
	describe: "Scan URLs, IPs, and domains for threat intelligence indicators",

	routes: {
		config: $config,
		results: $results,
	},
});

export default command;
