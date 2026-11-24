/**
 * delete command
 * @generated from apis/overlays/email-sending.ts
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
			placeholder: "subdomain-id",
			brief: "Sending subdomain identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <subdomain-id>",
	describe: "Delete a sending subdomain",
	usage:
		"$0 email-sending subdomains delete <subdomain-id>\n\nDisables sending on a subdomain and removes its DNS records. If routing is still active on the subdomain, only sending is disabled.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
