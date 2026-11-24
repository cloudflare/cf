import operation from "../../_operations/web-assets/labels/list.js";
/**
 * list command
 * @generated from apis/overlays/web-assets.ts
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
	describe: "List operation labels",
	usage:
		"$0 web-assets labels list\n\nReturns all managed and user-defined labels available for web and API operations in the zone.",
	flags: {
		page: {
			kind: "parsed",
			brief: "Page number of paginated results.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Maximum number of results per page.",
			optional: true,
			parse: Number,
		},
		order: {
			kind: "enum",
			brief: "Field to order by",
			values: [
				"name",
				"description",
				"created_at",
				"last_updated",
				"mapped_resources.operations",
			],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief: "Direction to order results.",
			values: ["asc", "desc"],
			optional: true,
		},
		source: {
			kind: "enum",
			brief: "Filter for labels with source",
			values: ["user", "managed"],
			optional: true,
		},
		filter: {
			kind: "parsed",
			brief:
				"Filter for labels where the name or description matches using substring match",
			optional: true,
			parse: String,
		},
		"with-mapped-resource-counts": {
			kind: "boolean",
			brief: "Include `mapped_resources` for each label",
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
				command: "web-assets labels list",
				classification: {
					safeFlags: [
						"order",
						"direction",
						"source",
						"with-mapped-resource-counts",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					page: argv["page"],
					per_page: argv["per-page"],
					order: argv["order"],
					direction: argv["direction"],
					source: argv["source"],
					filter: argv["filter"],
					with_mapped_resource_counts: argv["with-mapped-resource-counts"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf web-assets labels list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/api_gateway/labels`,
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
