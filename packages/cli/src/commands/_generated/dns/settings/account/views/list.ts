import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/dns.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 dns settings account views list\n\nList DNS Internal Views for an Account"
		)
		.option("name", {
			type: "string",
			description:
				"Exact value of the DNS view name. This is a convenience alias for `name.exact`.",
		})
		.option("name-exact", {
			type: "string",
			description: "Exact value of the DNS view name.",
		})
		.option("name-contains", {
			type: "string",
			description: "Substring of the DNS view name.",
		})
		.option("name-startswith", {
			type: "string",
			description: "Prefix of the DNS view name.",
		})
		.option("name-endswith", {
			type: "string",
			description: "Suffix of the DNS view name.",
		})
		.option("zone-id", {
			type: "string",
			description: "A zone ID that exists in the zones list for the view.",
		})
		.option("zone-name", {
			type: "string",
			description: "A zone name that exists in the zones list for the view.",
		})
		.option("match", {
			type: "string",
			description:
				"Whether to match all search requirements or at least one (any). If set to `all`, acts like a logical AND between filters. If set to `any`, acts like a logical OR instead.",
			choices: ["any", "all"],
		})
		.option("page", {
			type: "number",
			description: "Page number of paginated results.",
		})
		.option("per-page", {
			type: "number",
			description: "Number of results per page.",
		})
		.option("order", {
			type: "string",
			description: "Field to order DNS views by.",
			choices: ["name", "created_on", "modified_on"],
		})
		.option("direction", {
			type: "string",
			description: "Direction to order DNS views in.",
			choices: ["asc", "desc"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"dns-views-for-an-account-list-internal-dns-views">;
type Query = SdkQuery<"dns-views-for-an-account-list-internal-dns-views">;

const typedBuilder = withArgTypes<
	{
		match: Query["match"];
		order: Query["order"];
		direction: Query["direction"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List Internal DNS Views",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "dns settings account views list",
				classification: {
					safeFlags: ["match", "order", "direction", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					name: argv["name"],
					"name.exact": argv["name-exact"],
					"name.contains": argv["name-contains"],
					"name.startswith": argv["name-startswith"],
					"name.endswith": argv["name-endswith"],
					zone_id: argv["zone-id"],
					zone_name: argv["zone-name"],
					match: argv["match"],
					page: argv["page"],
					per_page: argv["per-page"],
					order: argv["order"],
					direction: argv["direction"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf dns settings account views list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dns_settings/views`,
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
					client.dns.settings.account.views.list({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, {
					successLabel: `Loaded`,
					paginationQuery: queryParams,
				});
			}
		),
};

export default command;
