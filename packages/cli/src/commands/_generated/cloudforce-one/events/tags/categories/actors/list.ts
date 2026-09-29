import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cloudforce-one events tags categories actors list\n\nReturns all known Actors from the shared CFONE-owned catalog. Accounts other than the catalog owner receive a redacted public projection: identity (`uuid`, `value`, `categoryUuid`, `categoryName`), metadata (`description`, `dateOfDiscovery`, `tlp`, `confidence`, `properties`), origin (`originCountryISO`, `originCountryISO_annotated`), and public aliases/references (`aliasGroupNames`, `aliases`, `externalReferences`, `externalReferences_annotated`). Owner-private fields (internal aliases, attribution, motive, opsec level, etc.) are stripped from non-owner responses."
		)
		.option("page", { type: "number", description: "Page" })
		.option("page-size", { type: "number", description: "PageSize" })
		.option("value", {
			type: "string",
			description: "Free-text substring match on actor name (Tag.value).",
		})
		.option("filters", {
			type: "string",
			description:
				'Structured filters as a JSON array of {field, op, value} objects. Same shape as the events search API. Common use: filter actors by country with filters=[{"field":"originCountryISO","op":"in","value":["IR","CN"]}]. Country values may be passed as alpha-2, alpha-3, name, or alias (e.g. "iran"). Max 10 entries per request, max 100 values per \'in\'. Accounts other than the catalog owner may only filter on fields that are also public-readable (`value`, `categoryName`, `aliasGroupNames`, `originCountryISO`); filtering on a redacted field returns 400. Performance notes: `originCountryISO` uses its B-tree index for equals/in. `endsWith` and `aliasGroupNames` contains/like are leading-wildcard scans and slow on large result sets. `aliasGroupNames` matches on JSON-encoded text, so substrings can cross alias boundaries ("apt28" also matches "apt280" when both appear in the same tag\'s alias list).',
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"get_TaggedActorList">;
type Query = SdkQuery<"get_TaggedActorList">;

const typedBuilder = withArgTypes<
	{
		filters: Query["filters"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "Lists all Actors",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one events tags categories actors list",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					page: argv["page"],
					pageSize: argv["page-size"],
					value: argv["value"],
					filters: argv["filters"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one events tags categories actors list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/tags/categories/actors`,
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
					client.cloudforceOne.events.tags.categories.actors.list({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
