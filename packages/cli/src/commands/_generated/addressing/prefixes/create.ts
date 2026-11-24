/**
 * create command
 * @generated from apis/overlays/addressing.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		asn: {
			kind: "parsed",
			brief:
				"Autonomous System Number (ASN) the prefix will be advertised under. Use 13335 for Cloudflare's ASN, or your own ASN as an integer without the AS prefix. The IRR route and RPKI ROA must authorize this ASN.",
			optional: true,
			parse: Number,
		},
		cidr: {
			kind: "parsed",
			brief: "IP Prefix in Classless Inter-Domain Routing format.",
			optional: true,
			parse: String,
		},
		"delegate-loa-creation": {
			kind: "boolean",
			brief:
				"Whether Cloudflare is allowed to generate the LOA document on behalf of the prefix owner.",
			default: false,
		},
		description: {
			kind: "parsed",
			brief: "Description of the prefix.",
			optional: true,
			parse: String,
		},
		"loa-document-id": {
			kind: "parsed",
			brief: "Identifier for the uploaded LOA document.",
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
	describe: "Add Prefix",
	usage: "$0 addressing prefixes create\n\nAdd a new prefix under the account.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
