import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/basin-catalog.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 basin-catalog namespaces tables list\n\nReturns a list of tables in the specified namespace within a Basin Catalog. Supports pagination for efficient traversal of large table collections."
		)
		.option("bucket-name", {
			type: "string",
			description: "Specifies the R2 bucket name.",
			demandOption: true,
		})
		.option("namespace", {
			type: "string",
			description:
				'The namespace identifier.\nFor nested namespaces, use %1F as separator (e.g., "bronze%1Fanalytics").',
			demandOption: true,
		})
		.option("page-token", {
			type: "string",
			description:
				"Opaque pagination token from a previous response.\nUse this to fetch the next page of results.",
		})
		.option("page-size", {
			type: "number",
			description:
				"Maximum number of tables to return per page.\nDefaults to 100, maximum 1000.",
		})
		.option("return-uuids", {
			type: "boolean",
			description:
				"Whether to include table UUIDs in the response.\nSet to true to receive the table_uuids array.",
		})
		.option("return-details", {
			type: "boolean",
			description:
				"Whether to include additional metadata (timestamps, locations).\nWhen true, response includes created_at, updated_at, metadata_locations, and locations arrays.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"basin-list-tables">;
type Query = SdkQuery<"basin-list-tables">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List tables in namespace",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "basin-catalog namespaces tables list",
				classification: {
					safeFlags: ["return-uuids", "return-details", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					page_token: argv["page-token"],
					page_size: argv["page-size"],
					return_uuids: argv["return-uuids"],
					return_details: argv["return-details"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf basin-catalog namespaces tables list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/basin-catalog/${argv["bucket-name"] == null ? "<bucket-name>" : encodeURIComponent(String(argv["bucket-name"]))}/namespaces/${argv["namespace"] == null ? "<namespace>" : encodeURIComponent(String(argv["namespace"]))}/tables`,
						pathParams: {
							"bucket-name": String(argv["bucket-name"] ?? ""),
							namespace: String(argv["namespace"] ?? ""),
						},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.basinCatalog.namespaces.tables.list({
						account_id: accountId,
						bucket_name: argv["bucket-name"],
						namespace: argv["namespace"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
