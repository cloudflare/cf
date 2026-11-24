/**
 * get command
 * @generated from apis/overlays/zones.ts
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get",
	describe: "Get Transformations configuration",
	usage:
		"$0 zones transformations-config get\n\nReturns the combined Transformations configuration for a zone, including the transformations toggle, allowed origins, and C2PA signing settings in a single response.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
