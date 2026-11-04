import operation from "../../../_operations/cache/origin-cloud-regions/bulk/delete.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * delete command
 * @generated from apis/overlays/cache.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cache origin-cloud-regions bulk delete\n\nRemoves up to 100 IP-to-cloud-region mappings in a single request. Each IP is validated independently — successfully deleted items are returned in the `succeeded` array and IPs that could not be found or are invalid are returned in the `failed` array."
		)
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("force", {
			type: "boolean",
			alias: "f",
			description: "Skip confirmation (useful in scripts and CI)",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "delete",
	describe: "Batch delete origin cloud region mappings",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cache origin-cloud-regions bulk delete",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf cache origin-cloud-regions bulk delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/origin/cloud_regions/batch`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body, [], 100)
								: undefined,
					});
					return;
				}
				if (argv.body === undefined) {
					throw new Error(
						"--body is required for this command. Pass --body '<json>' or --body @path/to/file.json."
					);
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body, [], 100) : undefined;
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (
					!(await confirmDelete({
						force: Boolean(argv.force),
						message: `Are you sure you want to delete these Origin Cloud Region configurations?`,
					}))
				) {
					return;
				}

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Deleting`, async () =>
						client.send(operation, { body: bodyData, zone_id: zoneId })
					);
					formatOutput(result, { successLabel: `Deleted` });
					return;
				}
			}
		),
};

export default command;
