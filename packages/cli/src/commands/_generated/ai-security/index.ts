import $customtopics from "./custom-topics/index.js";
import $get from "./get.js";
import $update from "./update.js";
/**
 * ai-security command
 * @generated from apis/overlays/ai-security.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "ai-security",
	describe:
		"Detect prompt injection, PII, and unsafe topics in traffic to your AI applications",

	routes: {
		get: $get,
		update: $update,
		"custom-topics": $customtopics,
	},
});

export default command;
