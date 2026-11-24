/**
 * get command
 * @generated from apis/overlays/workers-vpc.ts
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
	operands: [{ placeholder: "service-id", brief: "Service ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <service-id>",
	describe: "Get Workers VPC connectivity service",
	usage:
		"$0 workers-vpc services get <service-id>\n\nFetches a single Workers VPC connectivity service by its ID.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
