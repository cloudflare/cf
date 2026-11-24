import operation from "../../../_operations/api-security/schema-validation/schemas/get.js";
/**
 * get command
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
	command: "get <schema-id>",
	describe: "Get details of a schema",
	usage:
		"$0 api-security schema-validation schemas get <schema-id>\n\nGets the contents and metadata of a specific OpenAPI schema uploaded to API Security.",
	flags: {
		"omit-source": {
			kind: "boolean",
			brief:
				"Omit the source-files of schemas and only retrieve their meta-data.",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "schema-id",
			brief: "The unique identifier of the schema",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "api-security schema-validation schemas get",
				classification: {
					safeFlags: ["omit-source", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					omit_source: argv["omit-source"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf api-security schema-validation schemas get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/schema_validation/schemas/${argv["schema-id"] == null ? "<schema-id>" : encodeURIComponent(String(argv["schema-id"]))}`,
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
