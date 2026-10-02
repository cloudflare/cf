import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/logs.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	getZoneId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 logs datasets update <dataset-id>\n\nUpdates the enabled state and/or field configuration of an account or zone dataset."
		)
		.positional("dataset-id", {
			type: "string",
			description: "Log Explorer dataset ID.",
			demandOption: true,
		})
		.option("deletion-protection", {
			type: "boolean",
			description: "Set to `false` to allow deletion of this dataset.",
		})
		.option("enabled", {
			type: "boolean",
			description: "Whether to enable or disable log ingest for this dataset.",
		})
		.option("fields", {
			type: "string",
			description:
				"Controls which fields the API ingests after the update. Defaults\nto all available fields when absent.\n. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("filter", {
			type: "string",
			description:
				'Optional Logpush filter predicate to restrict which events are\ningested. If omitted, the existing filter is left unchanged. Set\nto an empty string (`""`) to clear the filter. Otherwise,\nreplaces the dataset\'s filter entirely.\nSee [Logpush filters](https://developers.cloudflare.com/logs/reference/filters/)\nfor syntax and examples.\n',
		})
		.option("filter-attack-traffic", {
			type: "boolean",
			description:
				"Whether to filter attack traffic from the Logpush job. If omitted,\nthe existing setting is left unchanged. Supported datasets are\n`http_requests`, `firewall_events`, and `network_analytics_logs`.\n",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request =
	SdkRequest<"generated:put:/{account_or_zone}/{account_or_zone_id}/logs/explorer/datasets/{dataset_id}">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <dataset-id>",
	describe: "Update an account or zone dataset",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "logs datasets update",
				classification: {
					safeFlags: [
						"deletion-protection",
						"enabled",
						"filter-attack-traffic",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId =
						argv.zone === undefined
							? await resolveAccountIdSilent()
							: undefined;
					const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
					const accountOrZoneId =
						argv.zone ?? __cfDryRunAccountId ?? "<account-id>";
					formatDryRun({
						command: "cf logs datasets update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/${accountOrZone}/${accountOrZoneId}/logs/explorer/datasets/${argv["dataset-id"] == null ? "<dataset-id>" : encodeURIComponent(String(argv["dataset-id"]))}`,
						pathParams: {
							"account-or-zone": String(accountOrZone),
							"account-or-zone-id": String(accountOrZoneId),
							"dataset-id": String(argv["dataset-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										deletion_protection: argv["deletion-protection"],
										enabled: argv["enabled"],
										fields: parseObjectArray(argv["fields"], "fields"),
										filter: resolveFileToken(
											argv["filter"] as string | undefined,
											"filter",
											"text"
										),
										filter_attack_traffic: argv["filter-attack-traffic"],
									}),
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

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.logs.datasets.update({
							...bodyData,
							account_or_zone: accountOrZone,
							account_or_zone_id: accountOrZoneId,
							dataset_id: argv["dataset-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["enabled"] === undefined) {
					throw new Error(
						"--enabled is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					deletion_protection: argv["deletion-protection"],
					enabled: argv["enabled"],
					fields: parseObjectArray(argv["fields"], "fields"),
					filter: resolveFileToken(
						argv["filter"] as string | undefined,
						"filter",
						"text"
					),
					filter_attack_traffic: argv["filter-attack-traffic"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.logs.datasets.update({
						...bodyData,
						account_or_zone: accountOrZone,
						account_or_zone_id: accountOrZoneId,
						dataset_id: argv["dataset-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
