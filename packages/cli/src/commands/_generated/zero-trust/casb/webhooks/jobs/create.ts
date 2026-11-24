/**
 * create command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"finding-instance-ids": {
			kind: "parsed",
			brief: "Array of finding instance IDs to send to the webhooks.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"webhook-ids": {
			kind: "parsed",
			brief: "Array of webhook IDs to trigger jobs for.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief:
				"Request body for creating up to 100 webhook jobs. The number of jobs is the product of webhook_ids and finding_instance_ids.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create webhook jobs",
	usage:
		"$0 zero-trust casb webhooks jobs create\n\nCreates webhook jobs to send a finding instance to one or more configured webhooks.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
