import operation from "../../_operations/logs/datasets/update.js";
/**
 * update command
 * @generated from apis/overlays/logs.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "update <dataset-id>",
	describe: "Update an account or zone dataset",
	usage:
		"$0 logs datasets update <dataset-id>\n\nUpdates the enabled state and/or field configuration of an account or zone dataset.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	flags: {
		"deletion-protection": {
			kind: "boolean",
			brief: "Set to `false` to allow deletion of this dataset.",
			optional: true,
		},
		enabled: {
			kind: "boolean",
			brief: "Whether to enable or disable log ingest for this dataset.",
			optional: true,
		},
		fields: {
			kind: "parsed",
			brief:
				'Controls which fields the API ingests after the update. Defaults\nto all available fields when absent. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"enabled": boolean, "name": string}].',
			optional: true,
			parse: String,
		},
		filter: {
			kind: "parsed",
			brief:
				'Optional Logpush filter predicate to restrict which events are\ningested. If omitted, the existing filter is left unchanged. Set\nto an empty string (`""`) to clear the filter. Otherwise,\nreplaces the dataset\'s filter entirely.\nSee [Logpush filters](https://developers.cloudflare.com/logs/reference/filters/)\nfor syntax and examples.\n',
			optional: true,
			parse: String,
		},
		"filter-attack-traffic": {
			kind: "boolean",
			brief:
				"Whether to filter attack traffic from the Logpush job. If omitted,\nthe existing setting is left unchanged. Supported datasets are\n`http_requests`, `firewall_events`, and `network_analytics_logs`.\n",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "dataset-id",
			brief: "Log Explorer dataset ID.",
			parse: String,
		},
	],
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
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["enabled"] === undefined) {
						throw new Error(
							"--enabled is required (or pass --body with this field set)."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
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
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
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

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_or_zone: accountOrZone,
							account_or_zone_id: accountOrZoneId,
							dataset_id: argv["dataset-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
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
					client.send(operation, {
						body: bodyData,
						account_or_zone: accountOrZone,
						account_or_zone_id: accountOrZoneId,
						dataset_id: argv["dataset-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
