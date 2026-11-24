/**
 * get command
 * @generated from apis/overlays/diagnostics.ts
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
	operands: [{ placeholder: "id", brief: "UUID.", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <id>",
	describe: "Get Endpoint Health Check",
	usage:
		"$0 diagnostics endpoint-healthchecks get <id>\n\nGet a single Endpoint Health Check.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
