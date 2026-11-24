import operation from "../../_operations/zaraz/history/list.js";
/**
 * list command
 * @generated from apis/overlays/zaraz.ts
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
	describe: "List Zaraz historical configuration records",
	usage:
		"$0 zaraz history list\n\nLists a history of published Zaraz configuration records for a zone.",
	flags: {
		offset: {
			kind: "parsed",
			brief:
				"Ordinal number to start listing the results with. Default value is 0.",
			optional: true,
			parse: Number,
		},
		limit: {
			kind: "parsed",
			brief: "Maximum amount of results to list. Default value is 10.",
			optional: true,
			parse: Number,
		},
		"sort-field": {
			kind: "enum",
			brief: "The field to sort by. Default is updated_at.",
			values: ["id", "user_id", "description", "created_at", "updated_at"],
			optional: true,
		},
		"sort-order": {
			kind: "enum",
			brief: "Sorting order. Default is DESC.",
			values: ["DESC", "ASC"],
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
				command: "zaraz history list",
				classification: {
					safeFlags: ["sort-field", "sort-order", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
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
					client.send(operation, { zone_id: zoneId, ...queryParams })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
