import { createCommandClient, getZoneId } from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/api-security.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 api-security schema-validation schemas operations list\n\nRetrieves all operations from the schema. Operations that already exist in API Shield Endpoint Management will be returned as full operations."
		)
		.option("schema-id", {
			type: "string",
			description: "The unique identifier of the schema",
			demandOption: true,
		})
		.option("feature", {
			type: "string",
			description:
				"Add feature(s) to the results. The feature name that is given here corresponds to the resulting feature object. Have a look at the top-level object description for more details on the specific meaning.",
		})
		.option("host", {
			type: "string",
			description: "Filter results to only include the specified hosts.",
		})
		.option("method", {
			type: "string",
			description: "Filter results to only include the specified HTTP methods.",
		})
		.option("endpoint", {
			type: "string",
			description:
				"Filter results to only include endpoints containing this pattern.",
		})
		.option("page", {
			type: "number",
			description: "Page number of paginated results.",
		})
		.option("per-page", {
			type: "number",
			description: "Maximum number of results per page.",
		})
		.check((argv) => {
			if (argv["per-page"] !== undefined && !Number.isFinite(argv["per-page"]))
				throw new Error("--per-page must be a number");
			return true;
		})
		.option("operation-status", {
			type: "string",
			description:
				"Filter results by whether operations exist in Web Asset Management or not. `new` will just return operations from the schema that do not exist otherwise. `existing` will just return operations from the schema that already exist.",
			choices: ["new", "existing"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"schema-validation-extract-operations-from-schema">;
type Query = SdkQuery<"schema-validation-extract-operations-from-schema">;

const typedBuilder = withArgTypes<
	{
		feature: Query["feature"];
		"operation-status": Query["operation_status"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "Retrieve all operations from the schema",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "api-security schema-validation schemas operations list",
				classification: {
					safeFlags: ["operation-status", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
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
					client.apiSecurity.schemaValidation.schemas.operations.list({
						zone_id: zoneId,
						schema_id: argv["schema-id"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
