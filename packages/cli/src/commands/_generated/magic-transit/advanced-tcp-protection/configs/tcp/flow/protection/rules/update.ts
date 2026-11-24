/**
 * update command
 * @generated from apis/overlays/magic-transit.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"burst-sensitivity": {
			kind: "parsed",
			brief:
				"The new burst sensitivity. Optional. Must be one of 'low', 'medium', 'high'.",
			optional: true,
			parse: String,
		},
		"protection-mode": {
			kind: "parsed",
			brief:
				"The new mode for TCP Flow Protection. Optional. Must be one of 'enabled', 'disabled', 'monitoring'.",
			optional: true,
			parse: String,
		},
		"rate-sensitivity": {
			kind: "parsed",
			brief:
				"The new rate sensitivity. Optional. Must be one of 'low', 'medium', 'high'.",
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
			brief: "The updates to apply to the TCP Flow Protection rule.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "rule-id",
			brief: "The UUID of the TCP Flow Protection rule to update.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <rule-id>",
	describe: "Update TCP Flow Protection rule.",
	usage:
		"$0 magic-transit advanced-tcp-protection configs tcp flow protection rules update <rule-id>\n\nUpdate a TCP Flow Protection rule specified by the given UUID.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
