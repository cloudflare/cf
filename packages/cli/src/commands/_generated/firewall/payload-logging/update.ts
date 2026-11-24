/**
 * update command
 * @generated from apis/overlays/firewall.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"public-key": {
			kind: "parsed",
			brief:
				"Defines the X25519 public key, as standard base64 of exactly 32 bytes, that encrypts matched payloads. Cloudflare stores only the public key; keep the private key to decrypt logged payloads.",
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
	command: "update",
	describe: "Set the payload logging key",
	usage:
		"$0 firewall payload-logging update\n\nCreates or replaces the public key that payload logging uses to encrypt matched payloads for the account or zone. It applies to every zone in the account or zone that has no zone key. Requires a plan that includes payload logging (Enterprise); otherwise it returns 403.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
