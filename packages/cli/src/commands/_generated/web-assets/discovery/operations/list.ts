import operation from "../../../_operations/web-assets/discovery/operations/list.js";
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
	describe: "List discovered web and API operations",
	usage:
		"$0 web-assets discovery operations list\n\nReturns the latest web and API operations discovered from zone traffic.",
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
		host: {
			kind: "parsed",
			brief: "Filter results to only include the specified hosts.",
			variadic: true,
			optional: true,
			parse: String,
		},
		method: {
			kind: "parsed",
			brief: "Filter results to only include the specified HTTP methods.",
			variadic: true,
			optional: true,
			parse: String,
		},
		endpoint: {
			kind: "parsed",
			brief:
				"Filter results to only include endpoints containing this pattern.",
			optional: true,
			parse: String,
		},
		direction: {
			kind: "enum",
			brief: "Direction to order results.",
			values: ["asc", "desc"],
			optional: true,
		},
		order: {
			kind: "enum",
			brief: "Field to order by",
			values: [
				"host",
				"method",
				"endpoint",
				"traffic_stats.requests",
				"traffic_stats.last_updated",
			],
			optional: true,
		},
		diff: {
			kind: "boolean",
			brief:
				"When `true`, only return API Discovery results that are not saved into API Shield Endpoint Management",
			optional: true,
		},
		origin: {
			kind: "enum",
			brief:
				"Filter results to only include discovery results sourced from a particular discovery engine\n  * `ML` - Discovered operations that were sourced using ML API Discovery\n  * `SessionIdentifier` - Discovered operations that were sourced using Session Identifier API Discovery",
			values: ["ML", "SessionIdentifier", "LabelDiscovery"],
			optional: true,
		},
		state: {
			kind: "enum",
			brief:
				"Filter results to only include discovery results in a particular state. States are as follows\n  * `review` - Discovered operations that are not saved into API Shield Endpoint Management\n  * `saved` - Discovered operations that are already saved into API Shield Endpoint Management\n  * `ignored` - Discovered operations that have been marked as ignored",
			values: ["review", "saved", "ignored"],
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
				command: "web-assets discovery operations list",
				classification: {
					safeFlags: [
						"direction",
						"order",
						"diff",
						"origin",
						"state",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					page: argv["page"],
					per_page: argv["per-page"],
					host: argv["host"],
					method: argv["method"],
					endpoint: argv["endpoint"],
					direction: argv["direction"],
					order: argv["order"],
					diff: argv["diff"],
					origin: argv["origin"],
					state: argv["state"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf web-assets discovery operations list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/api_gateway/discovery/operations`,
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
