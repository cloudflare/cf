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
	operands: [{ placeholder: "group-id", brief: "Identifier.", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <group-id>",
	describe: "Get a SCIM Group resource",
	usage:
		"$0 zero-trust identity-providers scim groups get <group-id>\n\nReturns a SCIM Group resource, including its direct members, synced to Cloudflare via the System for Cross-domain Identity Management (SCIM).",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
