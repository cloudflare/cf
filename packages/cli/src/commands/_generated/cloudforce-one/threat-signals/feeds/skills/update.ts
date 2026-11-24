/**
 * update command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"skill-ids": {
			kind: "parsed",
			brief:
				"Ordered array of Custom Skill UUIDs (max 20). Replaces the feed's custom skill assignments. Free accounts cannot assign custom skills. Managed default skills are unaffected.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "feed-id",
			brief: "UUID of the Threat Signals feed",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <feed-id>",
	describe: "Set Threat Signals feed skills",
	usage:
		"$0 cloudforce-one threat-signals feeds skills update <feed-id>\n\nReplaces the ordered custom skills assigned to a Threat Signals feed. Requires a paid Threat Signals subscription.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
