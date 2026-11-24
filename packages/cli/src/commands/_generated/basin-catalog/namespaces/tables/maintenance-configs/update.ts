import operation from "../../../../_operations/basin-catalog/namespaces/tables/maintenance-configs/update.js";
/**
 * update command
 * @generated from apis/overlays/basin-catalog.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <table-name>",
	describe: "Update table maintenance configuration",
	usage:
		"$0 basin-catalog namespaces tables maintenance-configs update <table-name>\n\nUpdate the maintenance configuration for a specific table. This allows you to enable or disable compaction and adjust target file sizes for optimization.",
	flags: {
		"bucket-name": {
			kind: "parsed",
			brief: "Specifies the R2 bucket name.",
			parse: String,
		},
		namespace: {
			kind: "parsed",
			brief:
				"The namespace identifier (use %1F as separator for nested namespaces).",
			parse: String,
		},
		"compaction-state": {
			kind: "parsed",
			brief: "Specifies the state of maintenance operations.",
			optional: true,
			choices: ["enabled", "disabled"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "compaction-state", "text"),
		},
		"compaction-target-size-mb": {
			kind: "parsed",
			brief:
				'Sets the target file size for compaction in megabytes. Defaults to "128".',
			optional: true,
			choices: ["64", "128", "256", "512"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "compaction-target-size-mb", "text"),
		},
		"snapshot-expiration-max-snapshot-age": {
			kind: "parsed",
			brief: "Updates the maximum age for snapshots optionally.",
			optional: true,
			parse: String,
		},
		"snapshot-expiration-min-snapshots-to-keep": {
			kind: "parsed",
			brief: "Updates the minimum number of snapshots to retain optionally.",
			optional: true,
			parse: Number,
		},
		"snapshot-expiration-state": {
			kind: "parsed",
			brief: "Specifies the state of maintenance operations.",
			optional: true,
			choices: ["enabled", "disabled"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "snapshot-expiration-state", "text"),
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Contains request to update table maintenance configuration.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{ placeholder: "table-name", brief: "The table name.", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "basin-catalog namespaces tables maintenance-configs update",
				classification: {
					safeFlags: [
						"compaction-state",
						"compaction-target-size-mb",
						"snapshot-expiration-state",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command:
							"cf basin-catalog namespaces tables maintenance-configs update",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/basin-catalog/${argv["bucket-name"] == null ? "<bucket-name>" : encodeURIComponent(String(argv["bucket-name"]))}/namespaces/${argv["namespace"] == null ? "<namespace>" : encodeURIComponent(String(argv["namespace"]))}/tables/${argv["table-name"] == null ? "<table-name>" : encodeURIComponent(String(argv["table-name"]))}/maintenance-configs`,
						pathParams: {
							"bucket-name": String(argv["bucket-name"] ?? ""),
							namespace: String(argv["namespace"] ?? ""),
							"table-name": String(argv["table-name"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										compaction: {
											state: argv["compaction-state"],
											target_size_mb: argv["compaction-target-size-mb"],
										},
										snapshot_expiration: {
											max_snapshot_age: resolveFileToken(
												argv["snapshot-expiration-max-snapshot-age"] as
													| string
													| undefined,
												"snapshot-expiration-max-snapshot-age",
												"text"
											),
											min_snapshots_to_keep:
												argv["snapshot-expiration-min-snapshots-to-keep"],
											state: argv["snapshot-expiration-state"],
										},
									}),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							bucket_name: argv["bucket-name"],
							namespace: argv["namespace"],
							table_name: argv["table-name"],
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					compaction: {
						state: argv["compaction-state"],
						target_size_mb: argv["compaction-target-size-mb"],
					},
					snapshot_expiration: {
						max_snapshot_age: resolveFileToken(
							argv["snapshot-expiration-max-snapshot-age"] as
								| string
								| undefined,
							"snapshot-expiration-max-snapshot-age",
							"text"
						),
						min_snapshots_to_keep:
							argv["snapshot-expiration-min-snapshots-to-keep"],
						state: argv["snapshot-expiration-state"],
					},
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						bucket_name: argv["bucket-name"],
						namespace: argv["namespace"],
						table_name: argv["table-name"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
