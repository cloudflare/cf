import operation from "../../_operations/web-assets/operations/list.js";
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
	describe: "List web and API operations",
	usage:
		"$0 web-assets operations list\n\nLists web and API operations tracked for the zone, including each operation's method, path, and feature configuration.",
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
			brief:
				"Field to order by. When requesting a feature, the feature keys are available for ordering as well, e.g., `thresholds.suggested_threshold`.",
			values: ["method", "host", "endpoint", "thresholds.$key"],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief: "Direction to order results.",
			values: ["asc", "desc"],
			optional: true,
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
		feature: {
			kind: "parsed",
			brief:
				"Add feature(s) to the results. The feature name that is given here corresponds to the resulting feature object. Have a look at the top-level object description for more details on the specific meaning.",
			variadic: true,
			optional: true,
			choices: [
				"thresholds",
				"parameter_schemas",
				"schema_info",
				"confidence_intervals",
			],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
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
				command: "web-assets operations list",
				classification: {
					safeFlags: ["order", "direction", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					page: argv["page"],
					per_page: argv["per-page"],
					order: argv["order"],
					direction: argv["direction"],
					host: argv["host"],
					method: argv["method"],
					endpoint: argv["endpoint"],
					feature: argv["feature"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf web-assets operations list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/api_gateway/operations`,
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
