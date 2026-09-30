import {
	createCommandClient,
	getAccountId,
	getZoneId,
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
 * @generated from apis/overlays/firewall.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 firewall access-rules list\n\nFetches IP Access rules of an account or zone. These rules apply to all the zones in the account or zone. You can filter the results using several optional parameters."
		)
		.option("configuration-target", {
			type: "string",
			description: "Defines the target to search in existing rules.",
			choices: ["ip", "ip_range", "asn", "country"],
		})
		.option("configuration-value", {
			type: "string",
			description:
				"Defines the target value to search for in existing rules: an IP address, an IP address range, or a country code, depending on the provided `configuration.target`.\nNotes: You can search for a single IPv4 address, an IP address range with a subnet of '/16' or '/24', or a two-letter ISO-3166-1 alpha-2 country code.",
		})
		.option("notes", {
			type: "string",
			description:
				"Defines the string to search for in the notes of existing IP Access rules.\nNotes: For example, the string 'attack' would match IP Access rules with notes 'Attack 26/02' and 'Attack 27/02'. The search is case insensitive.",
		})
		.option("match", {
			type: "string",
			description:
				"Defines the search requirements. When set to `all`, all the search requirements must match. When set to `any`, only one of the search requirements has to match.",
			choices: ["any", "all"],
		})
		.option("page", {
			type: "number",
			description:
				"Defines the requested page within paginated list of results.",
		})
		.option("per-page", {
			type: "number",
			description: "Defines the maximum number of results requested.",
		})
		.option("order", {
			type: "string",
			description: "Defines the field used to sort returned rules.",
			choices: ["configuration.target", "configuration.value", "mode"],
		})
		.option("direction", {
			type: "string",
			description: "Defines the direction used to sort returned rules.",
			choices: ["asc", "desc"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request =
	SdkRequest<"generated:get:/{account_or_zone}/{account_or_zone_id}/firewall/access_rules/rules">;
type Query =
	SdkQuery<"generated:get:/{account_or_zone}/{account_or_zone_id}/firewall/access_rules/rules">;

const typedBuilder = withArgTypes<
	{
		"configuration-target": Query["configuration.target"];
		match: Query["match"];
		order: Query["order"];
		direction: Query["direction"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List IP Access rules",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "firewall access-rules list",
				classification: {
					safeFlags: [
						"configuration-target",
						"match",
						"order",
						"direction",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					"configuration.target": argv["configuration-target"],
					"configuration.value": argv["configuration-value"],
					notes: argv["notes"],
					match: argv["match"],
					page: argv["page"],
					per_page: argv["per-page"],
					order: argv["order"],
					direction: argv["direction"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId =
						argv.zone === undefined
							? await resolveAccountIdSilent()
							: undefined;
					const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
					const accountOrZoneId =
						argv.zone ?? __cfDryRunAccountId ?? "<account-id>";
					formatDryRun({
						command: "cf firewall access-rules list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/${accountOrZone}/${accountOrZoneId}/firewall/access_rules/rules`,
						pathParams: {
							"account-or-zone": String(accountOrZone),
							"account-or-zone-id": String(accountOrZoneId),
						},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
				const accountOrZoneId =
					accountOrZone === "zones"
						? await getZoneId({ zone: argv.zone }, client, {
								quiet: argv.quiet,
							})
						: argv.local
							? LOCAL_ACCOUNT_ID
							: await getAccountId();
				if (accountOrZone === "zones") {
					argv.zoneId = accountOrZoneId;
				} else {
					argv.accountId = accountOrZoneId;
				}

				const result = await withProgress(`Loading`, async () =>
					client.firewall.accessRules.list({
						account_or_zone: accountOrZone,
						account_or_zone_id: accountOrZoneId,
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
