/**
 * edit command
 * @generated from apis/overlays/ssl.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"cloudflare-branding": {
			kind: "boolean",
			brief:
				"Whether or not to add Cloudflare Branding for the order.  This will add a subdomain of sni.cloudflaressl.com as the Common Name if set to true.",
			optional: true,
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
	operands: [
		{
			placeholder: "certificate-pack-id",
			brief: "The unique identifier for a certificate_pack.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <certificate-pack-id>",
	describe:
		"Restart Validation or Update Advanced Certificate Manager Certificate Pack",
	usage:
		"$0 ssl certificate-packs edit <certificate-pack-id>\n\nFor a given zone, restart validation or add cloudflare branding for an advanced certificate pack. The former is only a validation operation for a Certificate Pack in a validation_timed_out status.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
