/**
 * get command
 * @generated from apis/overlays/healthchecks.ts
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
		{ placeholder: "healthcheck-id", brief: "Identifier", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <healthcheck-id>",
	describe: "Health Check Details",
	usage:
		"$0 healthchecks get <healthcheck-id>\n\nFetch a single configured health check.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
