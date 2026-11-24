import operation from "../../_operations/web-assets/schemas/list.js";
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
	describe: "Export web and API operations as OpenAPI schemas",
	usage:
		"$0 web-assets schemas list\n\nReturns tracked web and API operations and their feature configuration rendered as OpenAPI schemas.",
	flags: {
		host: {
			kind: "parsed",
			brief: "Receive schema only for the given host(s).",
			variadic: true,
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
		"include-schema-kind": {
			kind: "parsed",
			brief: "Schema kinds to include in exported OpenAPI schemas.",
			variadic: true,
			optional: true,
			choices: ["learned"],
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
				command: "web-assets schemas list",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					host: argv["host"],
					feature: argv["feature"],
					include_schema_kind: argv["include-schema-kind"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf web-assets schemas list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/api_gateway/schemas`,
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
