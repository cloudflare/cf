/**
 * create command
 * @generated from apis/overlays/email-security.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		comments: {
			kind: "parsed",
			brief: "The comments field",
			optional: true,
			parse: String,
		},
		domain: {
			kind: "parsed",
			brief: "Domain that requires TLS enforcement.",
			optional: true,
			parse: String,
		},
		exclude: {
			kind: "parsed",
			brief: "Subdomains to exempt from TLS requirements.",
			variadic: true,
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
			brief: "Create a sending domain restriction.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create a sending domain restriction",
	usage:
		"$0 email-security sending-domain-restrictions create\n\nCreates a new sending domain restriction to enforce TLS requirements for a domain. Emails without TLS from this domain will be dropped unless the subdomain is in the exclude list.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
