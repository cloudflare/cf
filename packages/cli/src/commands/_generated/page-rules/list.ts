import operation from "../_operations/page-rules/list.js";
/**
 * list command
 * @generated from apis/overlays/page-rules.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "list",
	describe: "List Page Rules",
	usage: "$0 page-rules list\n\nFetches Page Rules in a zone.",
	flags: {
		order: {
			kind: "enum",
			brief: "The field used to sort returned Page Rules.",
			values: ["status", "priority"],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief: "The direction used to sort returned Page Rules.",
			values: ["asc", "desc"],
			optional: true,
		},
		match: {
			kind: "enum",
			brief:
				"When set to `all`, all the search requirements must match. When set to `any`, only one of the search requirements has to match.",
			values: ["any", "all"],
			optional: true,
		},
		status: {
			kind: "enum",
			brief: "The status of the Page Rule.",
			values: ["active", "disabled"],
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "page-rules list",
				classification: {
					safeFlags: ["order", "direction", "match", "status", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
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
});

export default command;
