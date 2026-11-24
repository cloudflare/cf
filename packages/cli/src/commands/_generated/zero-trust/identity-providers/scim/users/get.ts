/**
 * get command
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
	},
	operands: [{ placeholder: "user-id", brief: "Identifier.", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <user-id>",
	describe: "Get a SCIM User resource",
	usage:
		"$0 zero-trust identity-providers scim users get <user-id>\n\nReturns a SCIM User resource synced to Cloudflare via the System for Cross-domain Identity Management (SCIM).",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
