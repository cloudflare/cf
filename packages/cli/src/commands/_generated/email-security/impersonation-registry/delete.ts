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
			placeholder: "impersonation-registry-id",
			brief: "Impersonation registry entry identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <impersonation-registry-id>",
	describe: "Delete an impersonation registry entry",
	usage:
		"$0 email-security impersonation-registry delete <impersonation-registry-id>\n\nRemoves an entry from the impersonation registry. After deletion, this identity will no longer be protected from impersonation.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
