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
		name: {
			kind: "parsed",
			brief: "A user-friendly name for the deployment group.",
			optional: true,
			parse: String,
		},
		"policy-ids": {
			kind: "parsed",
			brief: "Contains an optional list of policy IDs assigned to a group.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"version-config": {
			kind: "parsed",
			brief:
				'Contains at least one version configuration. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"target_environment": (string | null), "version": string}].',
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
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create deployment group",
	usage:
		"$0 zero-trust devices deployment-groups create\n\nCreates a new deployment group. Policy IDs must be unique across all deployment groups. This endpoint is in Beta.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
