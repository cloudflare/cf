/**
 * create command
 * @generated from apis/overlays/magic-network-monitoring.ts
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
	command: "create",
	describe: "Generate authentication token for VPC flow logs export.",
	usage:
		"$0 magic-network-monitoring vpc-flows tokens create\n\nGenerate authentication token for VPC flow logs export.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
