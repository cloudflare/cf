/**
 * search command
 * @generated from apis/overlays/registrar-sandbox.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		query: {
			kind: "parsed",
			brief:
				'The search term to find domain suggestions. Accepts keywords, phrases, or full domain names.\n- Phrases: "coffee shop" returns coffeeshop.com, mycoffeeshop.net, etc.\n- Domain names: "example.com" returns example.com and variations across extensions',
			parse: String,
		},
		extensions: {
			kind: "parsed",
			brief:
				"Limits results to specific domain extensions from the supported set. If not specified,\nreturns results across all supported extensions. Extensions not in the supported\nset are silently ignored.",
			variadic: true,
			optional: true,
			parse: String,
		},
		limit: {
			kind: "parsed",
			brief:
				"Maximum number of domain suggestions to return. Defaults to 20 if not specified.",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "search",
	describe: "Search for available domains",
	usage:
		'$0 registrar-sandbox registrations search\n\nSearches for domain name suggestions based on a keyword, phrase, or partial domain name. Returns a list of potentially available domains with pricing information. **Important:** Results are non-authoritative and based on cached data. Always use the `/domain-check` endpoint to verify real-time availability before attempting registration. Suggestions are scoped to extensions supported for programmatic registration via this API (`POST /registrations`). Domains on unsupported extensions will not appear in results, even if they are available at the registry level. ### Use cases - Brand name discovery (e.g., "acme corp" → acmecorp.com, acmecorp.dev) - Keyword-based suggestions (e.g., "coffee shop" → coffeeshop.com, mycoffeeshop.net) - Alternative extension discovery (e.g., "example.com" → example.com, example.app, example.xyz) ### Workflow 1. Call this endpoint with a keyword or domain name. 2. Present suggestions to the user. 3. Call `/domain-check` with the user\'s chosen domains to confirm real-time availability and pricing. 4. Proceed to `POST /registrations` only for supported non-premium domains where the Check response returns `registrable: true`. **Note:** Searching with just a domain extension (e.g., "com" or ".app") is not supported. Provide a keyword or domain name.',
	...parameters,
	loader: () => import("./search.handler.js"),
});

export default command;
