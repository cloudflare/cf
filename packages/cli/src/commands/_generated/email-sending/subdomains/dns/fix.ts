/**
 * fix command
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
	command: "fix <subdomain-id>",
	describe: "Fix sending subdomain DNS records",
	usage:
		"$0 email-sending subdomains dns fix <subdomain-id>\n\nIdempotently re-applies the sending DNS records (creates missing records, re-applies the email_routing lock on records whose lock has been cleared). Refuses with a 409 if foreign MX, multiple SPF, multiple DMARC, or multiple DKIM records exist at the relevant DNS names — those require manual cleanup.",
	...parameters,
	loader: () => import("./fix.handler.js"),
});

export default command;
