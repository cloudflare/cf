import $directive from "./directive.js";
/**
 * user-agents command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "user-agents",
	describe: "Operations for robots-txt.top.user-agents",

	routes: {
		directive: $directive,
	},
});

export default command;
