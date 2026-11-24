import $robots from "./robots/index.js";
/**
 * ai-audit command
 * @generated from apis/overlays/ai-audit.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "ai-audit",
	describe: "ai-audit",

	routes: {
		robots: $robots,
	},
});

export default command;
