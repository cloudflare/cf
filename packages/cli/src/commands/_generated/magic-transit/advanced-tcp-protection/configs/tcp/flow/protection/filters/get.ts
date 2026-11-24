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
			placeholder: "filter-id",
			brief: "The UUID of the filter to retrieve.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <filter-id>",
	describe: "Get TCP Flow Protection filter.",
	usage:
		"$0 magic-transit advanced-tcp-protection configs tcp flow protection filters get <filter-id>\n\nGet a TCP Flow Protection filter specified by the given UUID.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
