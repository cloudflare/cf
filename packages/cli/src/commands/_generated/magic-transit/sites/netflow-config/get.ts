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
	operands: [{ placeholder: "site-id", brief: "Identifier", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <site-id>",
	describe: "NetFlow Configuration Details",
	usage:
		"$0 magic-transit sites netflow-config get <site-id>\n\nGet NetFlow configuration for a site.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
