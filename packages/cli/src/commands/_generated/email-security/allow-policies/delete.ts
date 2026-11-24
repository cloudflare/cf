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
		{
			placeholder: "policy-id",
			brief: "Allow policy identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <policy-id>",
	describe: "Delete an email allow policy",
	usage:
		"$0 email-security allow-policies delete <policy-id>\n\nRemoves an allow policy. After deletion, emails matching this pattern will be subject to normal security scanning and disposition actions.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
