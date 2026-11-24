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
			brief: "A comment describing the allowlist prefix. Optional.",
			optional: true,
			parse: String,
		},
		enabled: {
			kind: "boolean",
			brief: "Whether to enable the allowlist prefix into effect. Optional.",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "The updates to apply to the allowlist prefix.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "prefix-id",
			brief: "The UUID of the allowlist prefix to update.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <prefix-id>",
	describe: "Update allowlist prefix.",
	usage:
		"$0 magic-transit advanced-tcp-protection configs allowlist prefix update <prefix-id>\n\nUpdate an allowlist prefix specified by the given UUID.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
