import operation from "../../_operations/spectrum/apps/list.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * list command
 * @generated from apis/overlays/spectrum.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 spectrum apps list\n\nRetrieves a list of currently existing Spectrum applications inside a zone."
		)
		.option("page", {
			type: "number",
			description:
				"Page number of paginated results. This parameter is required in order to use other pagination parameters. If included in the query, `result_info` will be present in the response.",
		})
		.option("per-page", {
			type: "number",
			description: "Sets the maximum number of results per page.",
		})
		.option("direction", {
			type: "string",
			description: "Sets the direction by which results are ordered.",
			choices: ["asc", "desc"],
		})
		.option("order", {
			type: "string",
			description: "Application field by which results are ordered.",
			choices: ["protocol", "app_id", "created_on", "modified_on", "dns"],
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
	describe: "List Spectrum applications",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "spectrum apps list",
				classification: {
					safeFlags: ["direction", "order", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					page: argv["page"],
					per_page: argv["per-page"],
					direction: argv["direction"],
					order: argv["order"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf spectrum apps list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/spectrum/apps`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, { zone_id: zoneId, ...queryParams })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
