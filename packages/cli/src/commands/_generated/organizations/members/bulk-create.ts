/**
 * bulk-create command
 * @generated from apis/overlays/organizations.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"organization-id": {
			kind: "parsed",
			brief: "Organization ID",
			parse: String,
		},
		members: {
			kind: "parsed",
			brief:
				'Omitted or null members are treated as an empty batch. Provide as a JSON array of objects, null, or @path/to/file.json. Shape: [{"user": {...}}].',
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
	command: "bulk-create",
	describe: "Batch create organization members",
	usage:
		"$0 organizations members bulk-create\n\nBatch create multiple memberships that grant access to a specific Organization.",
	...parameters,
	loader: () => import("./bulk-create.handler.js"),
});

export default command;
