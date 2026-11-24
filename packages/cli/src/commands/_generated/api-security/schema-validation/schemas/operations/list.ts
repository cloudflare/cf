import operation from "../../../../_operations/api-security/schema-validation/schemas/operations/list.js";
/**
 * list command
 * @generated from apis/overlays/api-security.ts
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
	describe: "Retrieve all operations from the schema",
	usage:
		"$0 api-security schema-validation schemas operations list\n\nRetrieves all operations from the schema. Operations that already exist in API Shield Endpoint Management will be returned as full operations.",
	flags: {
		"schema-id": {
			kind: "parsed",
			brief: "The unique identifier of the schema",
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
		"operation-status": {
			kind: "enum",
			brief:
				"Filter results by whether operations exist in Web Asset Management or not. `new` will just return operations from the schema that do not exist otherwise. `existing` will just return operations from the schema that already exist.",
			values: ["new", "existing"],
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
				command: "api-security schema-validation schemas operations list",
				classification: {
					safeFlags: ["operation-status", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					feature: argv["feature"],
					host: argv["host"],
					method: argv["method"],
					endpoint: argv["endpoint"],
					page: argv["page"],
					per_page: argv["per-page"],
					operation_status: argv["operation-status"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command:
							"cf api-security schema-validation schemas operations list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/schema_validation/schemas/${argv["schema-id"] == null ? "<schema-id>" : encodeURIComponent(String(argv["schema-id"]))}/operations`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							"schema-id": String(argv["schema-id"] ?? ""),
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
					client.send(operation, {
						zone_id: zoneId,
						schema_id: argv["schema-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
