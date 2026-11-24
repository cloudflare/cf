/**
 * get command
 * @generated from apis/overlays/magic-transit.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "prefix-id",
			brief: "The UUID of the prefix.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <prefix-id>",
	describe: "Get prefix.",
	usage:
		"$0 magic-transit advanced-tcp-protection configs prefixes get <prefix-id>\n\nGet a prefix specified by the given UUID.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
