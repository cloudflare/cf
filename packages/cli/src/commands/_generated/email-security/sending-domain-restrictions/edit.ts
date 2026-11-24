/**
 * edit command
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
			brief: "Update a sending domain restriction.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "sending-domain-restriction-id",
			brief: "Sending domain restriction identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <sending-domain-restriction-id>",
	describe: "Update a sending domain restriction",
	usage:
		"$0 email-security sending-domain-restrictions edit <sending-domain-restriction-id>\n\nUpdates an existing sending domain restriction. Only provided fields will be modified. Changes affect which domains require TLS and which subdomains are excluded.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
