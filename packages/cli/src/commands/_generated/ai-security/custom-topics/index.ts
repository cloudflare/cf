import $get from "./get.js";
import $update from "./update.js";
/**
 * custom-topics command group
 * @generated from apis/overlays/ai-security.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "custom-topics",
	describe:
		"Organization-specific topic categories used by AI Security for Apps content detection",

	routes: {
		get: $get,
		update: $update,
	},
});

export default command;
