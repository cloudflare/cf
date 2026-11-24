/**
 * update command
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
			brief: "Replaces the entire list of policy IDs.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"version-config": {
			kind: "parsed",
			brief:
				'Replaces the entire version_config array. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"target_environment": (string | null), "version": string}].',
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
	operands: [{ placeholder: "group-id", brief: "Group ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <group-id>",
	describe: "Update deployment group",
	usage:
		"$0 zero-trust devices deployment-groups update <group-id>\n\nUpdates a deployment group. Returns 409 if any newly added policy IDs already belong to another deployment group. This endpoint is in Beta.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
