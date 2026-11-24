/**
 * edit command
 * @generated from apis/overlays/network.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		comment: {
			kind: "parsed",
			brief: "An optional description of the subnet.",
			optional: true,
			parse: String,
		},
		"is-default-network": {
			kind: "boolean",
			brief:
				"If `true`, this is the default subnet for the account. There can only be one default subnet per account.",
			optional: true,
		},
		name: {
			kind: "parsed",
			brief: "A user-friendly name for the subnet.",
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
	operands: [
		{
			placeholder: "subnet-id",
			brief: "The UUID of the subnet.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <subnet-id>",
	describe: "Update WARP IP subnet",
	usage:
		"$0 network subnets warp edit <subnet-id>\n\nUpdates a WARP IP assignment subnet. **Update constraints:** - The `network` field cannot be modified for WARP subnets. Only `name`, `comment`, and `is_default_network` can be updated. - IPv6 subnets cannot be updated",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
