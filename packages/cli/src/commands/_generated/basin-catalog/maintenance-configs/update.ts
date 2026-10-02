import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/basin-catalog.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 basin-catalog maintenance-configs update <bucket-name>\n\nUpdate the maintenance configuration for a catalog. This allows you to enable or disable compaction and adjust target file sizes for optimization."
		)
		.positional("bucket-name", {
			type: "string",
			description: "Specifies the R2 bucket name.",
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
		.option("snapshot-expiration-state", {
			type: "string",
			description: "Specifies the state of maintenance operations.",
			choices: ["enabled", "disabled"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"Contains request to update catalog maintenance configuration.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"basin-update-maintenance-config">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <bucket-name>",
	describe: "Update catalog maintenance configuration",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "basin-catalog maintenance-configs update",
				classification: {
					safeFlags: [
						"compaction-state",
						"compaction-target-size-mb",
						"snapshot-expiration-state",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf basin-catalog maintenance-configs update",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/basin-catalog/${argv["bucket-name"] == null ? "<bucket-name>" : encodeURIComponent(String(argv["bucket-name"]))}/maintenance-configs`,
						pathParams: { "bucket-name": String(argv["bucket-name"] ?? "") },
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
											state: resolveFileToken(
												argv["snapshot-expiration-state"] as string | undefined,
												"snapshot-expiration-state",
												"text"
											),
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
						client.basinCatalog.maintenanceConfigs.update({
							body: bodyData,
							account_id: accountId,
							bucket_name: argv["bucket-name"],
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
						state: resolveFileToken(
							argv["snapshot-expiration-state"] as string | undefined,
							"snapshot-expiration-state",
							"text"
						),
					},
				});
				const result = await withProgress(`Creating`, async () =>
					client.basinCatalog.maintenanceConfigs.update({
						body: bodyData,
						account_id: accountId,
						bucket_name: argv["bucket-name"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
