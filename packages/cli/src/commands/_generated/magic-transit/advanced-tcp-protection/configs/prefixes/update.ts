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
		comment: {
			kind: "parsed",
			brief: "A new comment for the prefix. Optional.",
			optional: true,
			parse: String,
		},
		excluded: {
			kind: "boolean",
			brief: "Whether to exclude the prefix from protection. Optional.",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "The updates to apply to the prefix.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "prefix-id",
			brief: "The UUID of the prefix to update.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <prefix-id>",
	describe: "Update prefix.",
	usage:
		"$0 magic-transit advanced-tcp-protection configs prefixes update <prefix-id>\n\nUpdate a prefix specified by the given UUID.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
