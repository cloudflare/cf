import operation from "../../../_operations/cloudforce-one/threat-intel/tags/list.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * list command
 * @generated from apis/overlays/cloudforce-one.ts
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
			"$0 cloudforce-one threat-intel tags list\n\nLists the account's tags. Use `search` to match tag values, `categoryUuid` to limit results to one category, and `filters` (a JSON array) to filter by fields such as `originCountryISO`, `actorCategory`, `motive`, or `priority`. Country filters accept alpha-2 or alpha-3 codes, names, or common aliases. Tags marked TLP:PURPLE are visible only to Cloudforce One."
		)
		.option("page", { type: "number", description: "Page" })
		.option("page-size", { type: "number", description: "PageSize" })
		.option("search", {
			type: "string",
			description:
				"Free-text substring match on tag value AND custom-field properties. Searches case-insensitively inside both `Tag.value` and the serialized `Tag.properties` JSON blob (keys, values, and annotation metadata like confidence/tlp are all searchable). Same serialized-text tradeoff as `aliasGroupNames` — substrings can cross JSON boundaries.",
		})
		.option("category-uuid", { type: "string", description: "CategoryUuid" })
		.option("filters", {
			type: "string",
			description:
				'Structured filters as a JSON array of {field, op, value} objects. Searchable fields: uuid, value, categoryName, description, dateOfDiscovery, tlp, confidence, actorCategory, motive, attributionOrganization, originCountryISO, aliases, externalReferences, opsecLevel, sophisticationLevel, activeDuration, priority, lastSeen, aliasGroupNames. Operators: equals, not, contains, startsWith, endsWith, gt, lt, gte, lte, like, in, find. Use \'in\' for bulk OR within a single field, e.g. filters=[{"field":"originCountryISO","op":"in","value":["IR","CN"]}]. Multiple entries are AND-joined. Max 10 entries per request, max 100 values per \'in\'. Per-field notes: `uuid` accepts only \'equals\' and \'in\' (other operators throw ValidationError) — matched against the canonical lowercase storage but callers may pass either case (the server lowercases before comparison); index-backed by the column\'s UNIQUE constraint and intended for batched UUID → tag resolution. `originCountryISO` uses its B-tree index for equals/not/in. `priority` uses its B-tree index for numeric comparisons. Other string columns (`actorCategory`, `motive`, etc.) are case-insensitive and unindexed; current catalog size makes this a non-issue. `endsWith` and `aliasGroupNames` contains/like are leading-wildcard scans and slow on large result sets. `aliasGroupNames` matches on the JSON-encoded text, so substrings can cross alias boundaries (a search for "apt28" will also match "apt280" if both appear in the same tag\'s alias list).',
		})
		.option("cache", {
			type: "string",
			description:
				"Cache strategy. 'from-graph' serves results from the graph-node KV cache when all requested UUIDs are cached; falls back to normal path on partial/zero hit.",
			choices: ["from-graph"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List tags",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one threat-intel tags list",
				classification: {
					safeFlags: ["cache", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					page: argv["page"],
					pageSize: argv["page-size"],
					search: argv["search"],
					categoryUuid: argv["category-uuid"],
					filters: argv["filters"],
					cache: argv["cache"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one threat-intel tags list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/tags`,
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
					client.send(operation, { account_id: accountId, ...queryParams })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
