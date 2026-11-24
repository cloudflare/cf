/**
 * update command
 * @generated from apis/overlays/ai-security.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		enabled: {
			kind: "boolean",
			brief: "Whether AI Security for Apps is enabled on the zone.",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "AI Security for Apps enablement status for a zone.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update",
	describe: "Update the AI Security for Apps status for a zone.",
	usage:
		"$0 ai-security update\n\nUpdate the AI Security for Apps status for the zone, enabling or disabling the detection. The detection results are exposed as `cf.llm.prompt.*` fields for use in custom rules and rate limiting rules; changes can take up to a minute to propagate.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
