/**
 * create command
 * @generated from apis/overlays/zones.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"account-id": {
			kind: "parsed",
			brief: "Identifier",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief:
				'The domain name. Per [RFC 1035](https://datatracker.ietf.org/doc/html/rfc1035#section-2.3.4) the overall zone name can be up to 253 characters, with each segment ("label") not exceeding 63 characters.',
			optional: true,
			parse: String,
		},
		type: {
			kind: "parsed",
			brief:
				"A full zone implies that DNS is hosted with Cloudflare. A partial zone is\ntypically a partner-hosted zone or a CNAME setup.\n",
			default: "full",
			choices: ["full", "partial", "secondary", "internal"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "type", "text"),
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
	describe: "Create Zone",
	usage:
		"$0 zones create\n\nCreates a new zone (domain) in your Cloudflare account. The zone is created in a pending state and must be activated by updating your domain's nameservers to point to Cloudflare, or by completing the verification process for partial (CNAME) setups.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
