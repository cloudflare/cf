/**
 * edit command
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
		"validation-method": {
			kind: "parsed",
			brief: "SSL validation method.",
			optional: true,
			choices: ["http", "cname", "txt", "email"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "validation-method", "text"),
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief:
				"SSL validation settings. Omit validation_method to use the current or default method.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "certificate-pack-id",
			brief: "Certificate Pack UUID.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <certificate-pack-id>",
	describe: "Update SSL Certificate Pack Validation Method",
	usage:
		"$0 ssl verification edit <certificate-pack-id>\n\nUpdate the configured SSL validation method for a Universal SSL certificate pack, or request another validation attempt for a pack in pending_validation. This endpoint does not change the validation method for advanced certificates. For an active certificate pack, a method-only update saves the method without rerunning validation or replacing the active certificate. For a pack pending validation, changing the method initializes validation using the requested method. Cloudflare may select a different method during automatic renewal. Omit validation_method, send an empty JSON object, or omit the request body to use the current or default method. For a pack in pending_validation, keeping the current method requests another validation attempt. Cloudflare may queue this attempt rather than complete validation before returning. For an active pack, an empty JSON object or a request without a body does not rerun DCV. The response returns the current status and does not guarantee that validation has completed. Available methods depend on the DNS setup and certificate authority. For Google Trust Services, Let's Encrypt, and SSL.com, full DNS setups support txt only, while partial DNS setups support txt or http. HTTP validation does not support wildcard certificates. This endpoint allows four PATCH requests per zone per 60 seconds.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
