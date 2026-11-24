import $generate from "./generate.js";
/**
 * filters command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "filters",
	describe: "Operations for priority-intelligence.filters",

	routes: {
		generate: $generate,
	},
});

export default command;
