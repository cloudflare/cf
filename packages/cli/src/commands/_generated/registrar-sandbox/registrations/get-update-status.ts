/**
 * get-update-status command
 * @generated from apis/overlays/registrar-sandbox.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "domain-name",
			brief:
				"Provides a fully qualified domain name (FQDN), including the extension (e.g., \`example.com\`, \`mybrand.app\`). The domain name uniquely identifies a registration. Cloudflare permits only one registration per domain, making the domain name a natural idempotency key for registration requests.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get-update-status <domain-name>",
	describe: "Get Update Status",
	usage:
		"$0 registrar-sandbox registrations get-update-status <domain-name>\n\nReturns the current status of a domain update workflow. Use this endpoint to poll for completion when the PATCH response returned `202 Accepted`. The URL is provided in the `links.self` field of the workflow status response. Poll this endpoint until the workflow reaches a terminal state or a state that requires user attention. Use increasing backoff between polls. When the workflow remains blocked on a third party, use a longer polling interval and do not poll indefinitely.",
	...parameters,
	loader: () => import("./get-update-status.handler.js"),
});

export default command;
