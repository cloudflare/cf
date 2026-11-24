import $traces from "./traces/index.js";
/**
 * agents command group
 * @generated from apis/overlays/o11y.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "agents",
	describe: "Operations for agents",

	routes: {
		traces: $traces,
	},
});

export default command;
