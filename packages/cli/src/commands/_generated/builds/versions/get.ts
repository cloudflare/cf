/**
 * get command
 * @generated from apis/overlays/builds.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"version-ids": {
			kind: "parsed",
			brief: "Comma-separated list of version UUIDs (max 20).",
			parse: String,
		},
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
	describe: "Get builds by Worker version",
	usage:
		"$0 builds versions get\n\nRetrieve builds associated with one or more Worker version IDs.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
