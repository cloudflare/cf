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
		expression: {
			kind: "parsed",
			brief: "The new filter expression. Optional.",
			optional: true,
			parse: String,
		},
		"filter-mode": {
			kind: "parsed",
			brief:
				"The new mode for the filter. Optional. Must be one of 'enabled', 'disabled', 'monitoring'.",
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
			brief: "The updates to apply to the filter.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "filter-id",
			brief: "The UUID of the filter to update.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <filter-id>",
	describe: "Update TCP Flow Protection filter.",
	usage:
		"$0 magic-transit advanced-tcp-protection configs tcp flow protection filters update <filter-id>\n\nUpdate a TCP Flow Protection filter specified by the given UUID.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
