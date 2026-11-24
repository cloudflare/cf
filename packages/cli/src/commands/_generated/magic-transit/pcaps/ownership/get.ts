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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get",
	describe: "List PCAPs Bucket Ownership",
	usage:
		"$0 magic-transit pcaps ownership get\n\nList all buckets configured for use with PCAPs API.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
