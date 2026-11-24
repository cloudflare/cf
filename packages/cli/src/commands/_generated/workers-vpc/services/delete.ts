/**
 * delete command
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [{ placeholder: "service-id", brief: "Service ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <service-id>",
	describe: "Delete Workers VPC connectivity service",
	usage:
		"$0 workers-vpc services delete <service-id>\n\nRemoves a single Workers VPC connectivity service by its ID. Any Worker bindings referencing this service will stop working.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
