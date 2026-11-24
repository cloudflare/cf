/**
 * create command
 * @generated from apis/overlays/iam.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"begin-verification": {
			kind: "boolean",
			brief: "Begin the verification process after creation",
			default: true,
		},
		"email-domain": {
			kind: "parsed",
			brief: "Email domain of the new SSO connector",
			optional: true,
			parse: String,
		},
		"use-fedramp-language": {
			kind: "boolean",
			brief:
				"Controls the display of FedRAMP language to the user during SSO login",
			default: false,
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
	describe: "Initialize new SSO connector",
	usage:
		"$0 iam sso create\n\nCreates a new SSO connector for logging into Cloudflare through an identity provider.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
