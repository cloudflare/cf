/**
 * create command
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
	command: "create",
	describe: "Create a sending subdomain",
	usage:
		"$0 email-sending subdomains create\n\nCreates a new sending subdomain or re-enables sending on an existing subdomain that had it disabled. If zone-level Email Sending has not been enabled yet, the zone flag is automatically set when the entitlement is present. A leftmost wildcard such as `*.example.com` is accepted only for accounts with wildcard Email Sending enabled. Wildcard senders share the base domain's DKIM signing identity and `cf-bounce.<base>` return path.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
