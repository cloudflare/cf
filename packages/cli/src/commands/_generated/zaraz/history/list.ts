import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/zaraz.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zaraz history list\n\nLists a history of published Zaraz configuration records for a zone."
		)
		.option("offset", {
			type: "number",
			description:
				"Ordinal number to start listing the results with. Default value is 0.",
		})
		.option("limit", {
			type: "number",
			description: "Maximum amount of results to list. Default value is 10.",
		})
		.option("sort-field", {
			type: "string",
			description: "The field to sort by. Default is updated_at.",
			choices: ["id", "user_id", "description", "created_at", "updated_at"],
		})
		.option("sort-order", {
			type: "string",
			description: "Sorting order. Default is DESC.",
			choices: ["DESC", "ASC"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"get-zones-zone_identifier-zaraz-history">;
type Query = SdkQuery<"get-zones-zone_identifier-zaraz-history">;

const typedBuilder = withArgTypes<
	{
		"sort-field": Query["sortField"];
		"sort-order": Query["sortOrder"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List Zaraz historical configuration records",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zaraz history list",
				classification: {
					safeFlags: ["sort-field", "sort-order", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					offset: argv["offset"],
					limit: argv["limit"],
					sortField: argv["sort-field"],
					sortOrder: argv["sort-order"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf zaraz history list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/settings/zaraz/history`,
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
					client.zaraz.history.list({
						zone_id: zoneId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
