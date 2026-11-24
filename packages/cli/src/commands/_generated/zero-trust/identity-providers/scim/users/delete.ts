/**
 * delete command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"identity-provider-id": { kind: "parsed", brief: "UUID.", parse: String },
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
	operands: [{ placeholder: "user-id", brief: "Identifier.", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <user-id>",
	describe: "Delete a SCIM User resource",
	usage:
		"$0 zero-trust identity-providers scim users delete <user-id>\n\nDeletes a SCIM User resource from the identity provider's SCIM population.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
