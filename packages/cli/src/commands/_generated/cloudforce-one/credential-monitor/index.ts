import $domains from "./domains/index.js";
import $matches from "./matches/index.js";
/**
 * credential-monitor command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "credential-monitor",
	describe: "Operations for credential-monitor",

	routes: {
		domains: $domains,
		matches: $matches,
	},
});

export default command;
