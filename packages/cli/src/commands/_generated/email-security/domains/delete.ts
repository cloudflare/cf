/**
 * delete command
 * @generated from apis/overlays/email-security.ts
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [
		{ placeholder: "domain-id", brief: "Domain identifier.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <domain-id>",
	describe: "Unprotect an email domain",
	usage:
		"$0 email-security domains delete <domain-id>\n\nRemoves email security protection from a domain. After deletion, emails for this domain will no longer be processed by Email Security. This action cannot be undone.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
