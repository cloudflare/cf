/**
 * status command
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
	command: "status <subdomain-id>",
	describe: "Get sending subdomain DNS status",
	usage:
		"$0 email-sending subdomains dns status <subdomain-id>\n\nReturns the desired DNS records for a sending subdomain along with a live diff against actual DNS state. Use this to detect missing, unlocked, foreign, or multi-record conflicts before deciding whether to call the fix endpoint. For wildcard sending rows, each call also rechecks the governing organizational-domain DMARC policy and reports policy drift that DNS Fix cannot repair.",
	...parameters,
	loader: () => import("./status.handler.js"),
});

export default command;
