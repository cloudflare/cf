/**
 * create command
 * @generated from apis/overlays/ssl.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"certificate-authority": {
			kind: "parsed",
			brief:
				"Certificate Authority selected for the order.  For information on any certificate authority specific details or restrictions [see this page for more details](https://developers.cloudflare.com/ssl/reference/certificate-authorities).",
			optional: true,
			choices: ["google", "lets_encrypt", "ssl_com"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "certificate-authority", "text"),
		},
		"cloudflare-branding": {
			kind: "boolean",
			brief:
				"Whether or not to add Cloudflare Branding for the order.  This will add a subdomain of sni.cloudflaressl.com as the Common Name if set to true.",
			optional: true,
		},
		hosts: {
			kind: "parsed",
			brief:
				"Comma separated list of valid host names for the certificate packs. Must contain the zone apex, may not contain more than 50 hosts, and may not be empty.",
			variadic: true,
			optional: true,
			parse: String,
		},
		type: {
			kind: "parsed",
			brief: "Type of certificate pack.",
			optional: true,
			choices: ["advanced"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "type", "text"),
		},
		"validation-method": {
			kind: "parsed",
			brief: "Validation Method selected for the order.",
			optional: true,
			choices: ["txt", "http", "email"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "validation-method", "text"),
		},
		"validity-days": {
			kind: "parsed",
			brief: "Validity Days selected for the order.",
			optional: true,
			parse: Number,
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
	describe: "Order Advanced Certificate Manager Certificate Pack",
	usage:
		"$0 ssl certificate-packs create\n\nFor a given zone, order an advanced certificate pack.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
