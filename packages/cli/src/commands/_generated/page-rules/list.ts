import operation from "../_operations/page-rules/list.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * list command
 * @generated from apis/overlays/page-rules.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage("$0 page-rules list\n\nFetches Page Rules in a zone.")
		.option("order", {
			type: "string",
			description: "The field used to sort returned Page Rules.",
			choices: ["status", "priority"],
		})
		.option("direction", {
			type: "string",
			description: "The direction used to sort returned Page Rules.",
			choices: ["asc", "desc"],
		})
		.option("match", {
			type: "string",
			description:
				"When set to `all`, all the search requirements must match. When set to `any`, only one of the search requirements has to match.",
			choices: ["any", "all"],
		})
		.option("status", {
			type: "string",
			description: "The status of the Page Rule.",
			choices: ["active", "disabled"],
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
	describe: "List Page Rules",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "page-rules list",
				classification: {
					safeFlags: ["order", "direction", "match", "status", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					order: argv["order"],
					direction: argv["direction"],
					match: argv["match"],
					status: argv["status"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf page-rules list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/pagerules`,
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
