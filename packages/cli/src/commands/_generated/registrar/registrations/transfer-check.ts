/**
 * transfer-check command
 * @generated from apis/overlays/registrar.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		domains: {
			kind: "parsed",
			brief:
				'List of domain objects to evaluate for transfer eligibility. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"domain_name": string, "auth_code"?: string}]. ? marks optional keys.',
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
			brief: "List of transferable domain objects to check.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "transfer-check",
	describe: "Check domain transfer eligibility",
	usage:
		"$0 registrar registrations transfer-check\n\nPerforms real-time, authoritative eligibility checks directly against needed requirements. Use this endpoint to verify a domain is available before attempting a transfer via `POST /registrations/:domain_name/transfer-in`. **Note:** This endpoint uses POST to accept a list of domains in the request body. It is a read-only operation — it does not create, modify, or reserve any domains. ### Behavior - Maximum 10 domains per request - Pricing is only returned for domains where `transferable: true` - Results are not cached; each request queries the registry & other needed upstreams ## Extension Support All `.uk` extensions (`.uk`, `.co.uk`, etc) do not support auth codes. As such, Cloudflare will ignore the `auth_code` section of this request for `.uk` domains. This means that a `.uk` domain depends on public data to obtain domain information, so it might be a few minutes outdated. ### Workflow 1. Call this endpoint with domains the user wants to transfer. 2. For each domain where `transferable: true`, present pricing to the user. 3. For each domain where `transferable: false`, present reasons to the user 4. Proceed to `POST /registrations/:domain_name/transfer-in` only for the `transferable: true` domains.",
	...parameters,
	loader: () => import("./transfer-check.handler.js"),
});

export default command;
