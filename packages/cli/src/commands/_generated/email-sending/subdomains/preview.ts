/**
 * preview command
 * @generated from apis/overlays/email-sending.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		name: {
			kind: "parsed",
			brief:
				"The domain name within the zone. A wildcard is allowed only as the complete leftmost label (`*.example.com`) and requires the account wildcard Email Sending entitlement. The derived Return-Path hostname, including its bounce prefix, must be at most 201 characters after ASCII conversion; wildcards use the base hostname.",
			optional: true,
			parse: String,
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
	command: "preview",
	describe: "Preview sending subdomain DNS",
	usage:
		"$0 email-sending subdomains preview\n\nReturns the DNS records that would be created for a sending subdomain, flags which records are missing, and reports any conflicts with existing DNS records. This is a read-only dry-run — no records are created or modified. Use before or after creating a subdomain to check DNS status. A leftmost wildcard requires wildcard Email Sending to be enabled for the account and previews base-scoped DKIM and return-path records.",
	...parameters,
	loader: () => import("./preview.handler.js"),
});

export default command;
