import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * search command
 * @generated from apis/overlays/registrar-sandbox.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			'$0 registrar-sandbox registrations search\n\nSearches for domain name suggestions based on a keyword, phrase, or partial domain name. Returns a list of potentially available domains with pricing information. **Important:** Results are non-authoritative and based on cached data. Always use the `/domain-check` endpoint to verify real-time availability before attempting registration. Suggestions are scoped to extensions supported for programmatic registration via this API (`POST /registrations`). Domains on unsupported extensions will not appear in results, even if they are available at the registry level. ### Use cases - Brand name discovery (e.g., "acme corp" → acmecorp.com, acmecorp.dev) - Keyword-based suggestions (e.g., "coffee shop" → coffeeshop.com, mycoffeeshop.net) - Alternative extension discovery (e.g., "example.com" → example.com, example.app, example.xyz) ### Workflow 1. Call this endpoint with a keyword or domain name. 2. Present suggestions to the user. 3. Call `/domain-check` with the user\'s chosen domains to confirm real-time availability and pricing. 4. Proceed to `POST /registrations` only for supported non-premium domains where the Check response returns `registrable: true`. **Note:** Searching with just a domain extension (e.g., "com" or ".app") is not supported. Provide a keyword or domain name.'
		)
		.option("query", {
			type: "string",
			description:
				'The search term to find domain suggestions. Accepts keywords, phrases, or full domain names.\n- Phrases: "coffee shop" returns coffeeshop.com, mycoffeeshop.net, etc.\n- Domain names: "example.com" returns example.com and variations across extensions',
			demandOption: true,
		})
		.option("extensions", {
			type: "string",
			description:
				"Limits results to specific domain extensions from the supported set. If not specified,\nreturns results across all supported extensions. Extensions not in the supported\nset are silently ignored.",
		})
		.option("limit", {
			type: "number",
			description:
				"Maximum number of domain suggestions to return. Defaults to 20 if not specified.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"sandbox-registrar-domain-discovery-search">;
type Query = SdkQuery<"sandbox-registrar-domain-discovery-search">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "search",
	describe: "Search for available domains",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "registrar-sandbox registrations search",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					q: argv["query"],
					extensions: argv["extensions"],
					limit: argv["limit"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf registrar-sandbox registrations search",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/registrar-sandbox/domain-search`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.registrarSandbox.registrations.search({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
