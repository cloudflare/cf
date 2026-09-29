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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/basin-catalog.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 basin-catalog namespaces tables maintenance-configs update <table-name>\n\nUpdate the maintenance configuration for a specific table. This allows you to enable or disable compaction and adjust target file sizes for optimization."
		)
		.positional("table-name", {
			type: "string",
			description: "The table name.",
			demandOption: true,
		})
		.option("bucket-name", {
			type: "string",
			description: "Specifies the R2 bucket name.",
			demandOption: true,
		})
		.option("namespace", {
			type: "string",
			description:
				"The namespace identifier (use %1F as separator for nested namespaces).",
			demandOption: true,
		})
		.option("compaction-state", {
			type: "string",
			description: "Specifies the state of maintenance operations.",
			choices: ["enabled", "disabled"],
		})
		.option("compaction-target-size-mb", {
			type: "string",
			description:
				'Sets the target file size for compaction in megabytes. Defaults to "128".',
			choices: ["64", "128", "256", "512"],
		})
		.option("snapshot-expiration-max-snapshot-age", {
			type: "string",
			description: "Updates the maximum age for snapshots optionally.",
		})
		.option("snapshot-expiration-min-snapshots-to-keep", {
			type: "number",
			description:
				"Updates the minimum number of snapshots to retain optionally.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"Contains request to update table maintenance configuration.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"basin-update-table-maintenance-config">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <table-name>",
	describe: "Update table maintenance configuration",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "basin-catalog namespaces tables maintenance-configs update",
				classification: {
					safeFlags: [
						"compaction-state",
						"compaction-target-size-mb",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
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
											state: resolveFileToken(
												argv["compaction-state"] as string | undefined,
												"compaction-state",
												"text"
											),
											target_size_mb: resolveFileToken(
												argv["compaction-target-size-mb"] as string | undefined,
												"compaction-target-size-mb",
												"text"
											),
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
										},
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.basinCatalog.namespaces.tables.maintenanceConfigs.update({
							body: bodyData,
							account_id: accountId,
							bucket_name: argv["bucket-name"],
							namespace: argv["namespace"],
							table_name: argv["table-name"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					compaction: {
						state: resolveFileToken(
							argv["compaction-state"] as string | undefined,
							"compaction-state",
							"text"
						),
						target_size_mb: resolveFileToken(
							argv["compaction-target-size-mb"] as string | undefined,
							"compaction-target-size-mb",
							"text"
						),
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
					},
				});
				const result = await withProgress(`Creating`, async () =>
					client.basinCatalog.namespaces.tables.maintenanceConfigs.update({
						body: bodyData,
						account_id: accountId,
						bucket_name: argv["bucket-name"],
						namespace: argv["namespace"],
						table_name: argv["table-name"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
