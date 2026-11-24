/**
 * check command
 * @generated from apis/overlays/registrar.ts
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
		body: {
			kind: "parsed",
			brief:
				'List of fully qualified domain names (FQDNs) to check. Each domain must include the extension (e.g., "example.com", not "example").',
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "domains",
			brief:
				"List of fully qualified domain names (FQDNs) to check for availability. Each domain must include the extension. - Minimum: 1 domain. - Maximum: 20 domains per request. - The response returns domains on unsupported extensions with \`registrable: false\` and a \`reason\` field. - The response may omit malformed domain names (e.g., names missing an extension). ",
			parse: String,
			rest: true,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "check <domains...>",
	describe: "Check domain availability",
	usage:
		"$0 registrar registrations check <domains...>\n\nPerforms real-time, authoritative availability checks directly against domain registries. Use this endpoint to verify a domain is available before attempting registration via `POST /registrations`. **Important:** Unlike the Search endpoint, these results are authoritative and reflect current registry status. Always check availability immediately before registration as domain status can change rapidly. **Note:** This endpoint uses POST to accept a list of domains in the request body. It is a read-only operation — it does not create, modify, or reserve any domains. ### Extension support Only domains on extensions supported for programmatic registration by this API can be registered. If you check a domain on an unsupported extension, the response will include `registrable: false` with a `reason` field explaining why: - `extension_not_supported_via_api` — Cloudflare Registrar supports this extension in the dashboard, but it is not yet available for programmatic registration via this API. Register via `https://dash.cloudflare.com/{account_id}/domains/registrations` instead. - `extension_not_supported` — This extension is not supported by Cloudflare Registrar. - `extension_disallows_registration` — The extension's registry has temporarily or permanently frozen new registrations. No registrar can register domains on this extension at this time. - `domain_premium` — The domain is premium priced. Premium registration is not currently supported by this API. - `domain_unavailable` — The domain is already registered, reserved, or otherwise not available for registration on a supported extension. The `reason` field is only present when `registrable` is `false`. ### Behavior - Maximum 20 domains per request - Pricing is only returned for domains where `registrable: true` - Results are not cached; each request queries the registry ### Workflow 1. Call this endpoint with domains the user wants to register. 2. For each domain where `registrable: true`, present pricing to the user. 3. If `tier: premium`, note that premium registration is not currently supported by this API and do not proceed to `POST /registrations`. 4. Proceed to `POST /registrations` only for supported non-premium domains.",
	...parameters,
	loader: () => import("./check.handler.js"),
});

export default command;
